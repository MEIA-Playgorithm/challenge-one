package meia.playgorithm.dialogue;

/** The current session user, inserted when the dialogue starts. */
public class DialogueUser {

    private final String id;

    public DialogueUser(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    /** Pattern form used by the rule metadata: user(Id). */
    public Term fact() {
        return Term.compound("user", Term.atom(id));
    }
}
