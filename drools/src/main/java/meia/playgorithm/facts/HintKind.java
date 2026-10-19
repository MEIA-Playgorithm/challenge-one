package meia.playgorithm.facts;

/** How a genre hint is applied (see GenreHint). */
public enum HintKind {
    /** One level per attribute: the hint with the lowest priority whose genres the movie has. */
    LEVEL,
    /** Every tag whose genres the movie has. */
    TAG,
    /** The genre itself is a known subgenre. */
    SUBGENRE
}
