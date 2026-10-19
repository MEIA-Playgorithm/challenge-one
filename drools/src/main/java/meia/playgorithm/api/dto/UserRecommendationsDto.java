package meia.playgorithm.api.dto;

import java.util.List;

@SnakeCase
public record UserRecommendationsDto(String userId, int total, int offset, int limit, List<RecommendationDto> items) {
}
