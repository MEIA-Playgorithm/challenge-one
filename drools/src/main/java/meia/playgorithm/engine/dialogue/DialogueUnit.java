package meia.playgorithm.engine.dialogue;

import org.drools.ruleunits.api.DataSource;
import org.drools.ruleunits.api.DataStore;
import org.drools.ruleunits.api.RuleUnitData;

import java.util.concurrent.atomic.AtomicLong;

public class DialogueUnit implements RuleUnitData {

    private static final AtomicLong SEQUENCE = new AtomicLong();

    private final DataStore<DialogueUser> users;
    private final DataStore<DialogueAnswer> answers;
    private final DataStore<DialogueQuestion> questions;
    private final DataStore<DialogueConclusion> conclusions;

    public DialogueUnit() {
        this.users = DataSource.createStore();
        this.answers = DataSource.createStore();
        this.questions = DataSource.createStore();
        this.conclusions = DataSource.createStore();
    }

    public DataStore<DialogueUser> getUsers() {
        return users;
    }

    public DataStore<DialogueAnswer> getAnswers() {
        return answers;
    }

    public DataStore<DialogueQuestion> getQuestions() {
        return questions;
    }

    public DataStore<DialogueConclusion> getConclusions() {
        return conclusions;
    }

    /** Creation order of answers and conclusions, used to number the facts in the explanations. */
    static long nextSequence() {
        return SEQUENCE.incrementAndGet();
    }
}
