package meia.playgorithm.facts;

import java.util.List;

/**
 * Reference knowledge from genre-hints.csv: a movie with one of these genres
 * gets this value for the attribute.
 */
public record GenreHint(HintKind kind, Attribute attribute, String value, int priority, List<String> genres) {

    public GenreHint {
        genres = List.copyOf(genres);
    }
}
