package meia.playgorithm.facts;

/** A genre or language the user dislikes. */
public record Dislikes(String userId, Attribute attribute, String value) {
}
