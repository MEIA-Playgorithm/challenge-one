package meia.playgorithm.facts;

import java.util.Locale;

/** An explicit user limit, named as its CSV column. */
public enum Limit {
    ALLOW_REWATCH, MAX_DURATION_MINUTES, YEAR_FROM, YEAR_TO, REQUIRED_LANGUAGES,
    DISLIKED_DIRECTORS, DISLIKED_STARS, SESSION_MIN_AGE, MIN_RATING, RATING_TOLERANCE, RATING_REQUIRED;

    public String key() {
        return name().toLowerCase(Locale.ROOT);
    }
}
