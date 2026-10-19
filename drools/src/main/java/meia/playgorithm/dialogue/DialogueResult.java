package meia.playgorithm.dialogue;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Working memory left by the dialogue, numbered in insertion order, with the
 * "How?" and "Why not?" explanations. Both inspect the rule metadata read by
 * {@link DialogueRule}: "how" follows the conditions each object was inserted
 * with, and "why not" follows every rule that could insert an object down to
 * its first unmet condition.
 */
public final class DialogueResult {

    /** A numbered working-memory object; {@code rule} is null when it was not inserted by a rule. */
    public record Fact(int number, Term term, String rule, List<Integer> evidence) {
        public boolean insertedByRule() {
            return rule != null;
        }

        public String describe() {
            return "#" + number + " " + DialogueRule.describe(term);
        }
    }

    private final String userId;
    private final List<DialogueQuestion> questions;
    private final List<DialogueAnswer> answers;
    private final List<DialogueConclusion> conclusions;
    private final List<DialogueRule> rules;
    private final List<Fact> facts;

    public DialogueResult(
        DialogueUser user,
        List<DialogueQuestion> questions,
        List<DialogueAnswer> answers,
        List<DialogueConclusion> conclusions,
        List<DialogueRule> rules
    ) {
        this.userId = user.getId();
        this.questions = List.copyOf(questions);
        this.answers = answers.stream().sorted(Comparator.comparingLong(DialogueAnswer::getSequence)).toList();
        this.conclusions = conclusions.stream().sorted(Comparator.comparingLong(DialogueConclusion::getSequence)).toList();
        this.rules = List.copyOf(rules);
        this.facts = numberFacts(user);
    }

    public String userId() {
        return userId;
    }

    public List<DialogueQuestion> questions() {
        return questions;
    }

    public List<DialogueAnswer> answers() {
        return answers;
    }

    public List<DialogueConclusion> conclusions() {
        return conclusions;
    }

    public List<DialogueRule> rules() {
        return rules;
    }

    public List<Fact> facts() {
        return facts;
    }

    public Optional<String> experience() {
        return conclusions.stream()
            .filter(conclusion -> conclusion.getType().equals("experiencia_sessao"))
            .map(DialogueConclusion::getValue)
            .findFirst();
    }

    public List<String> suggestedGenres() {
        return conclusions.stream()
            .filter(conclusion -> conclusion.getType().equals("sugerir_genero"))
            .map(DialogueConclusion::getValue)
            .toList();
    }

    /** Working-memory listing, one object per line. */
    public List<String> factLines() {
        return facts.stream()
            .map(fact -> fact.describe() + (fact.insertedByRule() ? "  (regra \"" + fact.rule() + "\")" : ""))
            .toList();
    }

    public Optional<Fact> findFact(String query) {
        return findFact(parseQuery(query));
    }

    /**
     * Reads a fact from the console: a conclusion type and value
     * ("sugerir_genero Romantic Comedy"), or a question key and answer
     * ("procura_aventura sim"; the answer defaults to sim).
     */
    public Term parseQuery(String query) {
        String text = query.trim();
        int space = text.indexOf(' ');
        String name = space < 0 ? text : text.substring(0, space);
        String value = space < 0 ? "" : text.substring(space + 1).trim().replaceAll("^['\"]|['\"]$", "");

        if (patternNames("conclusion").contains(name)) {
            if (value.isEmpty()) {
                throw new IllegalArgumentException("Indica também o valor, por exemplo: " + name + " <valor>");
            }
            return Term.compound("conclusion", Term.atom(name), Term.atom(value));
        }
        if (patternNames("answer").contains(name)) {
            return Term.compound("answer", Term.atom(name), Term.atom(value.isEmpty() ? DialogueQuestion.YES : value));
        }
        throw new IllegalArgumentException("Facto desconhecido: '" + name + "'. Tipos de conclusão: "
            + patternNames("conclusion") + ". Perguntas: " + patternNames("answer") + ".");
    }

    // How? ------------------------------------------------------------------

    /** "How?" for a fact number (#N) or a fact. */
    public List<String> how(String query) {
        List<String> lines = new ArrayList<>();
        String trimmed = query.trim().replaceFirst("^#", "");
        Optional<Fact> fact = trimmed.matches("\\d+")
            ? factNumber(Integer.parseInt(trimmed))
            : findFact(parseQuery(trimmed));
        fact.ifPresentOrElse(
            found -> how(found, 0, lines),
            () -> lines.add("Esse facto não está na memória de trabalho. Usa dialogue-why-not para ver porquê.")
        );
        return lines;
    }

    private void how(Fact fact, int level, List<String> lines) {
        String indent = "   ".repeat(level);
        lines.add(indent + fact.describe());
        if (!fact.insertedByRule()) {
            lines.add(indent + "   " + origin(fact));
            return;
        }
        lines.add(indent + "   foi inserido pela regra \"" + fact.rule()
            + "\", porque estes objetos satisfizeram as condições (when):");
        for (int evidence : fact.evidence()) {
            how(facts.get(evidence - 1), level + 1, lines);
        }
    }

    private String origin(Fact fact) {
        return fact.term().name().equals("user")
            ? "foi inserido no início da sessão (utilizador atual)"
            : "foi inserido com a resposta do utilizador";
    }

    // Why not? --------------------------------------------------------------

    private record UnmetRule(String id, Term condition) {
    }

    /** "Why not?" for a fact that is not in working memory. */
    public List<String> whyNot(String query) {
        List<String> lines = new ArrayList<>();
        whyNot(parseQuery(query), 0, lines);
        return lines;
    }

    private void whyNot(Term pattern, int level, List<String> lines) {
        String indent = "   ".repeat(level);
        String described = DialogueRule.describe(pattern);
        Optional<Fact> present = findFact(pattern);
        if (present.isPresent()) {
            lines.add(indent + described + " está na memória de trabalho (#" + present.get().number()
                + "). Usa dialogue-how " + present.get().number() + ".");
            return;
        }

        lines.add(indent + described + " não está na memória de trabalho.");
        List<UnmetRule> unmetRules = rulesThatCouldInsert(pattern);
        for (UnmetRule unmet : unmetRules) {
            lines.add(indent + "A regra \"" + unmet.id() + "\" podia inseri-lo, mas a condição "
                + DialogueRule.describe(unmet.condition()) + " não foi satisfeita:");
            whyNot(unmet.condition(), level + 1, lines);
        }
        if (unmetRules.isEmpty()) {
            lines.add(indent + notInsertedByRules(pattern));
        }
    }

    /** Every rule whose "then" could insert the pattern, with its first unmet condition. */
    private List<UnmetRule> rulesThatCouldInsert(Term pattern) {
        List<UnmetRule> unmetRules = new ArrayList<>();
        for (DialogueRule rule : rules) {
            DialogueRule renamed = rule.renamed();
            Map<String, Term> bindings = new HashMap<>();
            if (!Term.unify(renamed.inserts(), pattern, bindings)) {
                continue;
            }
            for (Term condition : renamed.conditions()) {
                Optional<Map<String, Term>> match = match(condition, bindings);
                if (match.isEmpty()) {
                    unmetRules.add(new UnmetRule(rule.id(), condition.substitute(bindings)));
                    break;
                }
                bindings.putAll(match.get());
            }
        }
        return unmetRules;
    }

    private String notInsertedByRules(Term pattern) {
        if (!pattern.name().equals("answer")) {
            return "Nenhuma regra do dialogue.drl insere este objeto.";
        }
        String key = pattern.args().get(0).name();
        Optional<DialogueAnswer> answer = answers.stream()
            .filter(candidate -> candidate.getKey().equals(key))
            .findFirst();
        if (answer.isPresent()) {
            return "Nenhuma regra o insere: depende da resposta do utilizador, que foi \""
                + answer.get().getValue() + "\" (" + answer.get() + ").";
        }
        return "Nenhuma regra o insere: depende de uma resposta do utilizador, mas essa pergunta não chegou a ser feita.";
    }

    // Working memory --------------------------------------------------------

    private Optional<Fact> factNumber(int number) {
        return number >= 1 && number <= facts.size() ? Optional.of(facts.get(number - 1)) : Optional.empty();
    }

    private Optional<Fact> findFact(Term pattern) {
        return facts.stream()
            .filter(fact -> Term.unifiable(pattern, fact.term()))
            .findFirst();
    }

    private Optional<Map<String, Term>> match(Term condition, Map<String, Term> bindings) {
        for (Fact fact : facts) {
            Map<String, Term> attempt = new HashMap<>(bindings);
            if (Term.unify(condition, fact.term(), attempt)) {
                return Optional.of(attempt);
            }
        }
        return Optional.empty();
    }

    private Set<String> patternNames(String kind) {
        Set<String> names = new LinkedHashSet<>();
        for (DialogueRule rule : rules) {
            List<Term> patterns = new ArrayList<>(rule.conditions());
            patterns.add(rule.inserts());
            patterns.stream()
                .filter(pattern -> pattern.name().equals(kind) && !pattern.args().get(0).variable())
                .forEach(pattern -> names.add(pattern.args().get(0).name()));
        }
        return names;
    }

    private List<Fact> numberFacts(DialogueUser user) {
        List<Fact> numbered = new ArrayList<>();
        numbered.add(new Fact(1, user.fact(), null, List.of()));

        List<Object> inserted = new ArrayList<>();
        inserted.addAll(answers);
        inserted.addAll(conclusions);
        inserted.sort(Comparator.comparingLong(DialogueResult::sequence));

        for (Object item : inserted) {
            if (item instanceof DialogueAnswer answer) {
                numbered.add(new Fact(numbered.size() + 1, answer.fact(), null, List.of()));
            } else if (item instanceof DialogueConclusion conclusion) {
                numbered.add(new Fact(
                    numbered.size() + 1,
                    conclusion.fact(),
                    conclusion.getRule(),
                    evidence(conclusion, numbered)
                ));
            }
        }
        return List.copyOf(numbered);
    }

    /** Numbers of the objects that matched the rule conditions when the conclusion was inserted. */
    private List<Integer> evidence(DialogueConclusion conclusion, List<Fact> known) {
        Optional<DialogueRule> rule = rules.stream()
            .filter(candidate -> candidate.id().equals(conclusion.getRule()))
            .findFirst();
        if (rule.isEmpty()) {
            return List.of();
        }

        DialogueRule renamed = rule.get().renamed();
        Map<String, Term> bindings = new HashMap<>();
        Term.unify(renamed.inserts(), conclusion.fact(), bindings);

        List<Integer> numbers = new ArrayList<>();
        for (Term condition : renamed.conditions()) {
            for (Fact fact : known) {
                Map<String, Term> attempt = new HashMap<>(bindings);
                if (Term.unify(condition, fact.term(), attempt)) {
                    bindings.putAll(attempt);
                    numbers.add(fact.number());
                    break;
                }
            }
        }
        return numbers;
    }

    private static long sequence(Object item) {
        return item instanceof DialogueAnswer answer
            ? answer.getSequence()
            : ((DialogueConclusion) item).getSequence();
    }
}
