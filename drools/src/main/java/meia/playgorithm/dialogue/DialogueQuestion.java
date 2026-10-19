package meia.playgorithm.dialogue;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * A question an "Ask" rule inserts because a dialogue rule needs the answer.
 * Before asking it, DialogueService adds the definition of that rule and a
 * snapshot of working memory, so the user can ask "porque?".
 */
public class DialogueQuestion {

    public static final String YES = "sim";
    public static final String NO = "nao";

    private final String userId;
    private final String key;
    private final String text;
    private final List<String> options;
    private final boolean choice;
    private final String rule;
    private DialogueRule ruleDefinition;
    private List<Term> workingMemory = List.of();

    private DialogueQuestion(String userId, String key, String text, List<String> options, boolean choice, String rule) {
        this.userId = userId;
        this.key = key;
        this.text = text;
        this.options = List.copyOf(options);
        this.choice = choice;
        this.rule = rule;
    }

    public static DialogueQuestion choice(String userId, String key, String textTemplate, List<String> options, String rule) {
        return new DialogueQuestion(userId, key, String.format(textTemplate, userId), options, true, rule);
    }

    public static DialogueQuestion yesNo(String userId, String key, String textTemplate, String rule) {
        return new DialogueQuestion(userId, key, String.format(textTemplate, userId), List.of(YES, NO), false, rule);
    }

    public String getUserId() {
        return userId;
    }

    public String getKey() {
        return key;
    }

    public String getText() {
        return text;
    }

    public List<String> getOptions() {
        return options;
    }

    public boolean isChoice() {
        return choice;
    }

    /** The rule that needs the answer. */
    public String getRule() {
        return rule;
    }

    public boolean accepts(String value) {
        return options.contains(value);
    }

    public DialogueAnswer answer(String value) {
        return new DialogueAnswer(userId, key, value, choice);
    }

    /** The pattern this question fills: answer(Key, _). */
    public Term term() {
        return Term.compound("answer", Term.atom(key), Term.parse("_"));
    }

    void explainedBy(DialogueRule ruleDefinition, List<Term> workingMemory) {
        this.ruleDefinition = ruleDefinition;
        this.workingMemory = List.copyOf(workingMemory);
    }

    /**
     * "Why?" explanation while the question is pending: the rule that needs
     * the answer, which of its conditions already match working memory, and
     * the conclusion the rule inserts if the answer completes the match.
     */
    public List<String> why() {
        List<String> lines = new ArrayList<>();
        lines.add("A avaliar a regra Drools \"" + rule + "\" (dialogue.drl).");
        if (ruleDefinition == null) {
            return lines;
        }

        DialogueRule definition = ruleDefinition.renamed();
        Map<String, Term> bindings = new HashMap<>();
        lines.add("Condições (when):");
        for (Term condition : definition.conditions()) {
            boolean satisfied = false;
            for (Term fact : workingMemory) {
                Map<String, Term> attempt = new HashMap<>(bindings);
                if (Term.unify(condition, fact, attempt)) {
                    bindings.putAll(attempt);
                    satisfied = true;
                    break;
                }
            }
            lines.add((satisfied ? "  [satisfeita] " : "  [em falta]   ")
                + DialogueRule.describe(condition.substitute(bindings)));
        }
        lines.add("Preciso da tua resposta para inserir " + DialogueRule.describe(term())
            + " na memória de trabalho.");
        lines.add("Se todas as condições forem satisfeitas, a regra insere (then): "
            + DialogueRule.describe(definition.inserts().substitute(bindings)));
        return lines;
    }
}
