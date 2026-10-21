package meia.playgorithm.model;

/** A genre or language the user likes. */
public record Likes(String userId, Attribute attribute, String value) {
}
