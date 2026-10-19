package meia.playgorithm.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import meia.playgorithm.api.dto.HowDto;
import meia.playgorithm.api.dto.WhyNotDto;
import meia.playgorithm.model.TraceEvent;
import meia.playgorithm.service.RecommendationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ExplanationController {

    private final RecommendationService recommendations;

    public ExplanationController(RecommendationService recommendations) {
        this.recommendations = recommendations;
    }

    @Operation(summary = "Explain how a recommendation was inferred")
    @GetMapping("/how")
    public HowDto how(@RequestParam("user_id") String userId, @RequestParam("movie") String movie) {
        return recommendations.how(userId, movie);
    }

    @Operation(summary = "Explain why a movie was not recommended")
    @GetMapping("/why-not")
    public WhyNotDto whyNot(@RequestParam("user_id") String userId, @RequestParam("movie") String movie) {
        return recommendations.whyNot(userId, movie);
    }

    @Operation(summary = "Return trace events")
    @GetMapping("/trace")
    public List<TraceEvent> trace(@RequestParam("user_id") String userId, @RequestParam(name = "movie", required = false) String movie) {
        return recommendations.trace(userId, movie);
    }
}
