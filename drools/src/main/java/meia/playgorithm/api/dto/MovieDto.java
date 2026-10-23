package meia.playgorithm.api.dto;

import java.util.List;
import meia.playgorithm.engine.KnowledgeBaseResult;
import meia.playgorithm.model.Attribute;
import meia.playgorithm.model.Movie;

/**
 * Um filme tal como a API Prolog o devolve: os dados do CSV e o perfil inferido pelas regras de
 * movies.drl. Os campos que o Drools não lê saem a null ou vazios.
 */
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

    public static MovieDto of(Movie movie, KnowledgeBaseResult knowledgeBase) {
        return new MovieDto(
            movie.id(),
            movie.title(),
            movie.year(),
            movie.votes(),
            movie.minutes(),
            emptyToNull(movie.ratingMpa()),
            movie.rating(),
            null,
            null,
            null,
            null,
            knowledgeBase.feature(movie.id(), Attribute.PACE).orElse(null),
            knowledgeBase.feature(movie.id(), Attribute.COMPLEXITY).orElse(null),
            knowledgeBase.feature(movie.id(), Attribute.VIOLENCE).orElse(null),
            knowledgeBase.feature(movie.id(), Attribute.HUMOR).orElse(null),
            knowledgeBase.feature(movie.id(), Attribute.AUDIENCE).orElse(null),
            knowledgeBase.feature(movie.id(), Attribute.PSYCHOLOGICAL_INTENSITY).orElse(null),
            movie.directors(),
            movie.writers(),
            movie.stars(),
            movie.genres(),
            movie.countries(),
            List.of(),
            movie.companies(),
            movie.languages(),
            knowledgeBase.features(movie.id(), Attribute.EMOTIONAL_TONE),
            knowledgeBase.features(movie.id(), Attribute.THEMES),
            knowledgeBase.features(movie.id(), Attribute.SUBGENRE)
        );
    }

    private static String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
