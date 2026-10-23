package meia.playgorithm.model;

import java.util.Locale;

/** A relation inferred between two movies (same genre, ..., similar movie). */
public enum Relation {
    SAME_GENRE, SAME_DIRECTOR, SAME_WRITER, SAME_STAR, SAME_PRODUCTION_COMPANY,
    SAME_LANGUAGE, SAME_COUNTRY_ORIGIN, SAME_ERA, SIMILAR_MOVIE;

    public String key() {
        return name().toLowerCase(Locale.ROOT);
    }
}
