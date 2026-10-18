package meia.playgorithm.api.controller;

import meia.playgorithm.api.http.ApiException;
import meia.playgorithm.catalog.MovieCatalog;
import meia.playgorithm.catalog.UserCatalog;
import meia.playgorithm.model.Recommendation;
import meia.playgorithm.model.RecommendationResult;
import meia.playgorithm.model.UserPreferences;
import meia.playgorithm.engine.DroolsRecommendationService;
import com.sun.net.httpserver.HttpExchange;
import java.util.List;
import java.util.Map;
import java.io.IOException;
import static meia.playgorithm.api.http.Http.*;
import static meia.playgorithm.api.view.JsonViews.*;

public final class UserRecommendationController {

    private static final DroolsRecommendationService SERVICE = new DroolsRecommendationService();

    public static void userRecommendations(HttpExchange exchange, Map<String, String> query) throws IOException {
        String userId = required(query, "user_id");
        int limit = intParam(query, "limit", 10);
        int offset = intParam(query, "offset", 0);
        validPage(limit, offset);
        UserPreferences preferences = UserCatalog.find(userId)
            .orElseThrow(() -> new ApiException(404, "Utilizador não encontrado"));
        RecommendationResult result = SERVICE.evaluate(preferences, MovieCatalog.movies());
        List<Recommendation> recommendations = result.recommendations();
        List<Map<String, Object>> items = page(recommendations, offset, limit).stream()
            .map(recommendation -> recommendationJson(recommendation, result))
            .toList();

        json(exchange, 200, Map.of(
            "user_id", userId,
            "total", recommendations.size(),
            "offset", offset,
            "limit", limit,
            "items", items
        ));
    }
}
