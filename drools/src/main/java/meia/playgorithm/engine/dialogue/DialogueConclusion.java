package meia.playgorithm.engine.dialogue;

/** A fact inserted by a dialogue rule, with the rule that inserted it. */
public class DialogueConclusion {

    private final String userId;
    private final String type;
    private final String value;
    private final String rule;
    private final long sequence;

    public DialogueConclusion(String userId, String type, String value, String rule) {
        this.userId = userId;
        this.type = type;
        this.value = value;
        this.rule = rule;
        this.sequence = DialogueUnit.nextSequence();
    }

    public String getUserId() {
        return userId;
    }

    public String getType() {
        return type;
    }

    public String getValue() {
        return value;
    }

    public String getRule() {
        return rule;
    }

    public long getSequence() {
        return sequence;
    }

    /** Pattern form used by the rule metadata: conclusion(Type, Value). */
    public Term fact() {
        return Term.compound("conclusion", Term.atom(type), Term.atom(value));
    }

    @Override
    public String toString() {
        return DialogueRule.describe(fact());
    }
}
