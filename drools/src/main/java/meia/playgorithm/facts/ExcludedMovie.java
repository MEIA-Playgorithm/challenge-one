package meia.playgorithm.facts;

/** The movie has at least one exclusion reason for the user. */
public record ExcludedMovie(String userId, String movieId, String rule) {
}
