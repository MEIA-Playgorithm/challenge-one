package meia.playgorithm.model;

/** Weighted similarity between two movies ("Similarity score" rule). */
public record SimilarityScore(String movieA, String movieB, int score, String rule) {
}
