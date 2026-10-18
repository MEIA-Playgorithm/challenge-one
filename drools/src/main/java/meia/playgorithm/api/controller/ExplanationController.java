package meia.playgorithm.api.controller;

import meia.playgorithm.api.view.JsonViews;
import meia.playgorithm.api.http.ApiException;
import meia.playgorithm.catalog.MovieCatalog;
import meia.playgorithm.catalog.UserCatalog;
import meia.playgorithm.model.Movie;
import meia.playgorithm.model.Recommendation;
import meia.playgorithm.model.RecommendationResult;
import meia.playgorithm.model.TraceEvent;
import meia.playgorithm.model.UserPreferences;
import meia.playgorithm.engine.DroolsRecommendationService;
import com.sun.net.httpserver.HttpExchange;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.io.IOException;
import static meia.playgorithm.api.http.Http.*;
import static meia.playgorithm.api.view.JsonViews.*;

public final class ExplanationController {

    private static final DroolsRecommendationService SERVICE = new DroolsRecommendationService();

    public static void how(HttpExchange exchange, Map<String, String> query) throws IOException {
        RecommendationResult result = userRun(query);
        String movieQuery = required(query, "movie");
        Optional<Recommendation> recommendation = result.findRecommendation(movieQuery);
        if (recommendation.isEmpty()) {
            json(exchange, 200, Map.of(
                "explanation_type", "how",
                "movie", movieQuery,
                "conclusion", "No recommendation conclusion was produced for this movie. Use /api/why-not to inspect the rejection path.",
                "trace", result.traceFor(movieQuery)
            ));
            return;
        }

        json(exchange, 200, howJson(recommendation.get(), result));
    }

    public static void whyNot(HttpExchange exchange, Map<String, String> query) throws IOException {
        RecommendationResult result = userRun(query);
        Movie movie = result.findMovie(required(query, "movie"))
            .orElseThrow(() -> new ApiException(404, "Filme não encontrado"));
        if (result.findRecommendation(movie.getId()).isPresent()) {
            json(exchange, 200, Map.of(
                "explanation_type", "why_not",
                "movie", movieJson(movie),
                "conclusion", "The movie was recommended, so there is no rejection path. Use /api/how for the inference path.",
                "trace", result.traceFor(movie)
            ));
            return;
        }

        List<TraceEvent> trace = result.traceFor(movie);
        List<Map<String, Object>> exclusions = trace.stream()
            .filter(event -> event.type().equals("EXCLUSION"))
            .map(JsonViews::traceJson)
            .toList();
        json(exchange, 200, Map.of(
            "explanation_type", "why_not",
            "movie", movieJson(movie),
            "conclusion", exclusions.isEmpty()
                ? "The movie was not recommended because no positive preference path produced a recommendation."
                : "The movie was discarded by mandatory or rejection rules.",
            "exclusions", exclusions,
            "trace", trace.stream().map(JsonViews::traceJson).toList()
        ));
    }

    public static void trace(HttpExchange exchange, Map<String, String> query) throws IOException {
        RecommendationResult result = userRun(query);
        if (query.containsKey("movie")) {
            json(exchange, 200, result.traceFor(query.get("movie")).stream().map(JsonViews::traceJson).toList());
            return;
        }
        json(exchange, 200, result.traceEvents().stream().map(JsonViews::traceJson).toList());
    }

    public static RecommendationResult userRun(Map<String, String> query) {
        String userId = required(query, "user_id");
        UserPreferences preferences = UserCatalog.find(userId)
            .orElseThrow(() -> new ApiException(404, "Utilizador não encontrado"));
        return SERVICE.evaluate(preferences, MovieCatalog.movies());
    }
}
