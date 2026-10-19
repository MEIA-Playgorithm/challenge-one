package meia.playgorithm.facts;

/** An inferred movie classification, such as mainstream, movie_90s or multi_genre. */
public record MovieClass(String movieId, MovieCategory category, String rule) {
}
