package meia.playgorithm.facts;

/** The movie satisfies at least one preference of the user. */
public record MatchesPreferences(String userId, String movieId, String rule) {
}
