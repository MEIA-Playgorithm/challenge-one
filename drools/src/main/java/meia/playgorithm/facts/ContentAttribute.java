package meia.playgorithm.facts;

/** An attribute inferred from genre hints; a movie with no matching hint gets the value unknown. */
public record ContentAttribute(Attribute attribute) {
}
