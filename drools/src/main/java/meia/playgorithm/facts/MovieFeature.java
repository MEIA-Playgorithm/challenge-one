package meia.playgorithm.facts;

/** An inferred value of a movie attribute, such as pace fast, emotional_tone dark or era modern. */
public record MovieFeature(String movieId, Attribute feature, String value, String rule) {
}
