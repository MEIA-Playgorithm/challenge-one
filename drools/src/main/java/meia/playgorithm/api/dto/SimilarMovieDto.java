package meia.playgorithm.api.dto;

/** Um filme parecido com outro e a sua semelhança (0 a 11). */
@SnakeCase
public record SimilarMovieDto(int score, MovieDto movie) {
}
