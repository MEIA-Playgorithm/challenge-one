package meia.playgorithm.api.dto;

import java.util.List;

@SnakeCase
public record SimilarMoviesDto(String sourceId, int total, List<SimilarMovieDto> items) {
}
