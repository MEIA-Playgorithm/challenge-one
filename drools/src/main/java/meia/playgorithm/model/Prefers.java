package meia.playgorithm.model;

/** A flexible preference for a movie attribute, such as director or pace. */
public record Prefers(String userId, Attribute attribute, String value) {
}
