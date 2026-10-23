package meia.playgorithm.model;

/** Why a movie is excluded for a user , e.g. disliked_genre(Horror). */
public record ExclusionReason(String userId, String movieId, Exclusion reason, String detail, String rule) {

    public String label() {
        return detail.isEmpty() ? reason.key() : reason.key() + "(" + detail + ")";
    }
}
