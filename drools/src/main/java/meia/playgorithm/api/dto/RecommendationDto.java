package meia.playgorithm.api.dto;

import java.util.List;
import java.util.Map;
import meia.playgorithm.model.Movie;
import meia.playgorithm.model.Recommendation;

@SnakeCase
public record RecommendationDto(
    double score,
    List<ReasonDto> reasons,
    MovieDto movie,
    String status,
    List<Object> satisfiedRequirements,
    List<UnmetDto> unmetPreferences,
    Map<String, Double> scoreBreakdown
) {

    public static RecommendationDto of(Recommendation recommendation, Movie movie) {
        return new RecommendationDto(
            recommendation.getScore(),
            recommendation.getReasons().stream().map(ReasonDto::of).toList(),
            MovieDto.of(movie),
            recommendation.getStatus(),
            List.of(),
            recommendation.getUnmetPreferences().stream().map(UnmetDto::of).toList(),
            recommendation.getScoreBreakdown()
        );
    }
}
