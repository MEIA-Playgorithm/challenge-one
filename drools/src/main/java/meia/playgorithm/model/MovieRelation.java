package meia.playgorithm.model;

/** An inferred relation between two movies, such as same_genre or similar_movie. */
public record MovieRelation(Relation relation, String movieA, String movieB, String rule) {
}
