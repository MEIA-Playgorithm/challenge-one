package meia.playgorithm.model;

import java.util.List;

/** The sorted genres of a movie. */
public record MovieGenres(String movieId, List<String> genres, String rule) {

    public MovieGenres {
        genres = List.copyOf(genres);
    }
}
