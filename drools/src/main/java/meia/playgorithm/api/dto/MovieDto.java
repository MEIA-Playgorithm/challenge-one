package meia.playgorithm.api.dto;

import java.util.List;
import meia.playgorithm.model.Movie;

/** Um filme tal como a API Prolog o devolve; os campos que o Drools não conhece saem a null ou vazios. */
@SnakeCase
public record MovieDto(
    String id,
    String title,
    Integer year,
    Integer vote,
    Integer duration,
    String ratingMpa,
    Double ratingImdb,
    Integer budget,
    Integer win,
    Integer nomination,
    Integer oscar,
    String pace,
    String complexity,
    String violence,
    String humor,
    String audience,
    String psychologicalIntensity,
    List<String> director,
    List<String> writer,
    List<String> star,
    List<String> genre,
    List<String> countryOrigin,
    List<String> filmingLocation,
    List<String> productionCompany,
    List<String> language,
    List<String> emotionalTone,
    List<String> themes,
    List<String> subgenre
) {

    public static MovieDto of(Movie movie) {
        return new MovieDto(
            movie.getId(),
            movie.getTitle(),
            movie.getYear() > 0 ? movie.getYear() : null,
            null,
            movie.getDurationMinutes() > 0 ? movie.getDurationMinutes() : null,
            emptyToNull(movie.getRatingMpa()),
            movie.getRatingImdb() > 0 ? movie.getRatingImdb() : null,
            null,
            null,
            null,
            null,
            emptyToNull(movie.getPace()),
            emptyToNull(movie.getComplexity()),
            emptyToNull(movie.getViolence()),
            emptyToNull(movie.getHumor()),
            emptyToNull(movie.getAudience()),
            emptyToNull(movie.getPsychologicalIntensity()),
            List.copyOf(movie.getDirectors()),
            List.copyOf(movie.getWriters()),
            List.copyOf(movie.getStars()),
            List.copyOf(movie.getGenres()),
            List.copyOf(movie.getCountries()),
            List.of(),
            List.of(),
            List.copyOf(movie.getLanguages()),
            List.copyOf(movie.getEmotionalTones()),
            List.copyOf(movie.getThemes()),
            List.copyOf(movie.getSubgenres())
        );
    }

    private static String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
