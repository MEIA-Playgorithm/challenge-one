package meia.playgorithm.facts;

/** Weighted similarity between two movies ("Similarity score" rule). */
public record SimilarityScore(String movieA, String movieB, int score, String rule) {
}
