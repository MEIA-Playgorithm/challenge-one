package meia.playgorithm.model;

/** A preference a movie satisfies for a user, e.g. genre(Action) with weight 40. */
public record PreferenceReason(String userId, String movieId, Reason reason, String value, int weight, String rule) {

    public String label() {
        return value.isEmpty() ? reason.key() : reason.key() + "(" + value + ")";
    }
}
