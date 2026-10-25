package meia.playgorithm.model;

import java.util.Locale;

/** A kind of preference reason: a movie attribute, the wishlist or the watch history. */
public enum Reason {
    GENRE, LANGUAGE, DIRECTOR, WRITER, STAR, COUNTRY_ORIGIN,
    SUBGENRE, PACE, COMPLEXITY, VIOLENCE, HUMOR, PSYCHOLOGICAL_INTENSITY,
    EMOTIONAL_TONE, THEMES, AUDIENCE, ERA, POPULARITY,
    WISHLIST, LIKED_SIMILARITY;

    public String key() {
        return name().toLowerCase(Locale.ROOT);
    }

    public static Reason of(Attribute attribute) {
        return valueOf(attribute.name());
    }

    /** Genre, director and star have their own score groups; every other reason is secondary. */
    public boolean isSecondary() {
        return this != GENRE && this != DIRECTOR && this != STAR;
    }
}
