package meia.playgorithm.model;

import java.util.Locale;

/** Why a movie is excluded for a user . */
public enum Exclusion {
    WATCHED, DISLIKED_GENRE, DISLIKED_LANGUAGE, AUDIENCE_AGE,
    DISLIKED_DIRECTOR, DISLIKED_STAR, DURATION_LIMIT,
    YEAR_FROM, YEAR_TO, REQUIRED_LANGUAGES, RATING_LIMIT;

    public String key() {
        return name().toLowerCase(Locale.ROOT);
    }
}
