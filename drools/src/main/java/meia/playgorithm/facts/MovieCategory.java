package meia.playgorithm.facts;

import java.util.Locale;

/** A classification inferred for a movie (mainstream, 90s, multi-genre, ...). */
public enum MovieCategory {
    MAINSTREAM, NICHE,
    MOVIE_90S, MOVIE_2000S, MOVIE_2010S, MOVIE_2020S,
    MULTI_GENRE;

    public String key() {
        return name().toLowerCase(Locale.ROOT);
    }
}
