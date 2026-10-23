package meia.playgorithm.engine.dialogue;

import org.drools.ruleunits.api.RuleUnitInstance;
import org.drools.ruleunits.api.RuleUnitProvider;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Runs the experience dialogue. The rules fire until they need an answer the
 * user has not given (an "Ask" rule inserted a DialogueQuestion); the question
 * is answered through the {@link Asker}, the answer is inserted into working
 * memory and the rules fire again. When the Asker has no answer yet, the
 * dialogue stops and the question is left pending in the result.
 */
@Service
public class DialogueService {

    private static final List<DialogueRule> RULES = DialogueRule.load();

    @FunctionalInterface
    public interface Asker {
        /** Returns one of {@link DialogueQuestion#getOptions()}, or null to stop with the question pending. */
        String ask(DialogueQuestion question);
    }

    public DialogueResult run(String userId, Asker asker) {
        DialogueUnit unit = new DialogueUnit();
        DialogueUser user = new DialogueUser(userId);
        unit.getUsers().add(user);

        RuleUnitInstance<DialogueUnit> instance = RuleUnitProvider.get().createRuleUnitInstance(unit);
        try {
            List<DialogueQuestion> asked = new ArrayList<>();
            DialogueQuestion unanswered = null;
            while (true) {
                instance.fire();
                List<DialogueQuestion> pending = query(instance, "FindPendingQuestions", "$question");
                if (pending.isEmpty()) {
                    break;
                }

                DialogueQuestion question = pending.get(0);
                List<Term> workingMemory = workingMemory(instance, user);
                RULES.stream()
                    .filter(rule -> rule.id().equals(question.getRule()))
                    .findFirst()
                    .ifPresent(rule -> question.explainedBy(rule, workingMemory));

                String value = asker.ask(question);
                if (value == null) {
                    unanswered = question;
                    break;
                }
                if (!question.accepts(value)) {
                    throw new IllegalArgumentException("Invalid answer '" + value + "' for " + question.getKey()
                        + ". Expected one of " + question.getOptions());
                }
                asked.add(question);
                unit.getAnswers().add(question.answer(value));
            }

            return new DialogueResult(
                user,
                asked,
                query(instance, "FindDialogueAnswers", "$answer"),
                query(instance, "FindDialogueConclusions", "$conclusion"),
                RULES,
                unanswered
            );
        } finally {
            instance.close();
        }
    }

    private static List<Term> workingMemory(RuleUnitInstance<DialogueUnit> instance, DialogueUser user) {
        List<Term> facts = new ArrayList<>();
        facts.add(user.fact());
        List<DialogueAnswer> answers = query(instance, "FindDialogueAnswers", "$answer");
        answers.forEach(answer -> facts.add(answer.fact()));
        List<DialogueConclusion> conclusions = query(instance, "FindDialogueConclusions", "$conclusion");
        conclusions.forEach(conclusion -> facts.add(conclusion.fact()));
        return facts;
    }

    @SuppressWarnings("unchecked")
    private static <T> List<T> query(RuleUnitInstance<DialogueUnit> instance, String name, String variable) {
        List<T> values = new ArrayList<>();
        for (var row : instance.executeQuery(name)) {
            values.add((T) row.get(variable));
        }
        return values;
    }
}
