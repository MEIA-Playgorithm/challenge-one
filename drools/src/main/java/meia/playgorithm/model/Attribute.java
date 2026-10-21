package meia.playgorithm.model;

import java.util.Locale;

/**
 * A movie attribute a user can like, dislike or prefer, and that a preference
 * reason can refer to. The key is the name used in the CSV files (pace,
 * country_origin, ...).
 */
public enum Attribute {
    GENRE, LANGUAGE, DIRECTOR, WRITER, STAR, COUNTRY_ORIGIN,
    SUBGENRE, PACE, COMPLEXITY, VIOLENCE, HUMOR, PSYCHOLOGICAL_INTENSITY,
    EMOTIONAL_TONE, THEMES, AUDIENCE, ERA, POPULARITY;

    public String key() {
        return name().toLowerCase(Locale.ROOT);
    }

    public static Attribute fromKey(String key) {
        return valueOf(key.toUpperCase(Locale.ROOT));
    }
}
