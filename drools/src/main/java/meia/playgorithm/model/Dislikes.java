package meia.playgorithm.model;

/** A genre or language the user dislikes. */
public record Dislikes(String userId, Attribute attribute, String value) {
}
