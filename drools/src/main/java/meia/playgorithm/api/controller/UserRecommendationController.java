package meia.playgorithm.api.controller;

import static meia.playgorithm.api.Validation.PAGE;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import meia.playgorithm.api.dto.UserRecommendationsDto;
import meia.playgorithm.service.RecommendationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserRecommendationController {

    private final RecommendationService recommendations;

    public UserRecommendationController(RecommendationService recommendations) {
        this.recommendations = recommendations;
    }

    @Operation(summary = "List recommendations for a CSV user profile")
    @GetMapping("/recomendacoes_utilizador")
    public UserRecommendationsDto userRecommendations(
        @RequestParam("user_id") String userId,
        @RequestParam(name = "limit", defaultValue = "10") @Min(value = 1, message = PAGE) @Max(value = 100, message = PAGE) int limit,
        @RequestParam(name = "offset", defaultValue = "0") @Min(value = 0, message = PAGE) int offset
    ) {
        return recommendations.forUser(userId, limit, offset);
    }
}
