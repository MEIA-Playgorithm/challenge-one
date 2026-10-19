package meia.playgorithm.dialogue;

import org.drools.drl.ast.descr.BaseDescr;
import org.drools.drl.ast.descr.PackageDescr;
import org.drools.drl.ast.descr.PatternDescr;
import org.drools.drl.ast.descr.RuleDescr;
import org.drools.drl.parser.DrlParser;
import org.drools.drl.parser.DroolsParserException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * A dialogue conclusion rule as the explanations see it: its "when" patterns
 * and the conclusion its "then" inserts, read from dialogue.drl with the DRL
 * parser. The rule is written once, in the DRL; nothing here duplicates it.
 *
 * Patterns become terms: /users is user(Id), /answers[ key == "k", affirmative ]
 * is answer(k, sim) and /conclusions[ type == "t", value == "v" ] is
 * conclusion(t, v). A field without a constraint is a variable named after the
 * pattern binding ($answer gives Answer), so "then" can refer to it.
 */
public record DialogueRule(String id, List<Term> conditions, Term inserts) {

    private static final String RESOURCE = "/meia/playgorithm/dialogue/dialogue.drl";
    private static final Pattern OOPATH = Pattern.compile("^/(\\w+)(?:\\[(.*)])?$", Pattern.DOTALL);
    private static final Pattern EQUALS = Pattern.compile("^(\\w+)\\s*==\\s*\"([^\"]*)\"$");
    private static final Pattern CONCLUSION = Pattern.compile(
        "new DialogueConclusion\\(\\s*[^,]+,\\s*\"(\\w+)\",\\s*(?:\"([^\"]*)\"|\\$(\\w+)\\.getValue\\(\\))");

    /** The conclusion rules of dialogue.drl, in file order. */
    public static List<DialogueRule> load() {
        PackageDescr descr = parse();
        List<DialogueRule> rules = new ArrayList<>();
        for (RuleDescr rule : descr.getRules()) {
            Matcher conclusion = CONCLUSION.matcher(String.valueOf(rule.getConsequence()));
            if (!conclusion.find()) {
                continue; // "Ask" rules insert questions, not conclusions.
            }
            List<Term> conditions = new ArrayList<>();
            for (BaseDescr element : rule.getLhs().getDescrs()) {
                // Negated patterns only stop a conclusion from being inserted twice.
                if (element instanceof PatternDescr pattern) {
                    conditions.add(condition(pattern));
                }
            }
            Term value = conclusion.group(2) != null ? Term.atom(conclusion.group(2)) : variable(conclusion.group(3));
            rules.add(new DialogueRule(rule.getName(), conditions,
                Term.compound("conclusion", Term.atom(conclusion.group(1)), value)));
        }
        return List.copyOf(rules);
    }

    /** Copy with variables renamed apart. */
    public DialogueRule renamed() {
        Map<String, Term> renames = new HashMap<>();
        return new DialogueRule(
            id,
            conditions.stream().map(condition -> condition.renamed(renames)).toList(),
            inserts.renamed(renames)
        );
    }

    /**
     * Describes a pattern as the working-memory object it matches, e.g.
     * answer(experiencia, comedia) as DialogueAnswer(key == "experiencia", value == "comedia").
     */
    public static String describe(Term pattern) {
        List<Term> args = pattern.args();
        return switch (pattern.name()) {
            case "user" -> "DialogueUser(" + field("id", args.get(0)) + ")";
            case "answer" -> "DialogueAnswer(" + fields("key", args.get(0), "value", args.get(1)) + ")";
            case "conclusion" -> "DialogueConclusion(" + fields("type", args.get(0), "value", args.get(1)) + ")";
            default -> pattern.toString();
        };
    }

    private static Term condition(PatternDescr pattern) {
        String path = pattern.getConstraint().getDescrs().get(0).toString().trim();
        Matcher oopath = OOPATH.matcher(path);
        if (!oopath.matches()) {
            throw new IllegalStateException("Unsupported dialogue pattern: " + path);
        }

        Map<String, String> fields = new HashMap<>();
        String constraints = oopath.group(2) == null ? "" : oopath.group(2);
        for (String constraint : constraints.split(",")) {
            String trimmed = constraint.trim();
            Matcher equals = EQUALS.matcher(trimmed);
            if (equals.matches()) {
                fields.put(equals.group(1), equals.group(2));
            } else if (trimmed.equals("affirmative")) {
                fields.put("value", DialogueQuestion.YES);
            } else if (!trimmed.isEmpty()) {
                throw new IllegalStateException("Unsupported dialogue constraint: " + trimmed);
            }
        }

        String binding = pattern.getIdentifier();
        return switch (oopath.group(1)) {
            case "users" -> Term.compound("user", value(fields, "id", binding));
            case "answers" -> Term.compound("answer", value(fields, "key", null), value(fields, "value", binding));
            case "conclusions" -> Term.compound("conclusion", value(fields, "type", null), value(fields, "value", binding));
            default -> throw new IllegalStateException("Unsupported dialogue data store: " + oopath.group(1));
        };
    }

    private static Term value(Map<String, String> fields, String field, String binding) {
        if (fields.containsKey(field)) {
            return Term.atom(fields.get(field));
        }
        return binding == null ? Term.parse("_") : variable(binding.substring(1));
    }

    private static Term variable(String name) {
        return Term.parse(Character.toUpperCase(name.charAt(0)) + name.substring(1));
    }

    private static PackageDescr parse() {
        try (InputStream input = DialogueRule.class.getResourceAsStream(RESOURCE)) {
            if (input == null) {
                throw new IllegalStateException("Missing " + RESOURCE);
            }
            DrlParser parser = new DrlParser();
            PackageDescr descr = parser.parse(null, new String(input.readAllBytes(), StandardCharsets.UTF_8));
            if (parser.hasErrors()) {
                throw new IllegalStateException("Could not parse " + RESOURCE + ": " + parser.getErrors());
            }
            return descr;
        } catch (IOException | DroolsParserException exception) {
            throw new IllegalStateException("Could not read " + RESOURCE, exception);
        }
    }

    private static String fields(String firstName, Term first, String secondName, Term second) {
        return isAnonymous(second)
            ? field(firstName, first)
            : field(firstName, first) + ", " + field(secondName, second);
    }

    private static String field(String name, Term value) {
        if (value.variable()) {
            String variable = value.toString();
            return name + " == $" + Character.toLowerCase(variable.charAt(0)) + variable.substring(1);
        }
        return name + " == \"" + value.name() + "\"";
    }

    private static boolean isAnonymous(Term term) {
        return term.variable() && term.name().startsWith("_");
    }
}
