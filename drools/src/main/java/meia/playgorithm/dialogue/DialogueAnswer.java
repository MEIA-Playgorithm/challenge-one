package meia.playgorithm.dialogue;

/** The user's answer to a {@link DialogueQuestion}, inserted into working memory. */
public class DialogueAnswer {

    private final String userId;
    private final String key;
    private final String value;
    private final boolean choice;
    private final long sequence;

    public DialogueAnswer(String userId, String key, String value, boolean choice) {
        this.userId = userId;
        this.key = key;
        this.value = value;
        this.choice = choice;
        this.sequence = DialogueUnit.nextSequence();
    }

    public String getUserId() {
        return userId;
    }

    public String getKey() {
        return key;
    }

    public String getValue() {
        return value;
    }

    public boolean isChoice() {
        return choice;
    }

    public boolean isAffirmative() {
        return !choice && DialogueQuestion.YES.equals(value);
    }

    public long getSequence() {
        return sequence;
    }

    /** Pattern form used by the rule metadata: answer(Key, Value). */
    public Term fact() {
        return Term.compound("answer", Term.atom(key), Term.atom(value));
    }

    @Override
    public String toString() {
        return DialogueRule.describe(fact());
    }
}
