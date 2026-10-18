package meia.playgorithm.model;

public record TraceEvent(
    String type,
    String rule,
    String movieId,
    String movieTitle,
    String details
) {
}
