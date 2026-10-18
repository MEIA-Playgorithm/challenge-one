package meia.playgorithm.api.controller;

import meia.playgorithm.api.view.JsonViews;
import meia.playgorithm.api.http.ApiException;
import meia.playgorithm.catalog.MovieCatalog;
import meia.playgorithm.model.Movie;
import com.sun.net.httpserver.HttpExchange;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.io.IOException;
import static meia.playgorithm.api.http.Http.*;
import static meia.playgorithm.api.view.JsonViews.*;

public final class MovieController {

    public static void movies(HttpExchange exchange, Map<String, String> query) throws IOException {
        int limit = intParam(query, "limit", 20);
        int offset = intParam(query, "offset", 0);
        validPage(limit, offset);
        validEnum(query.get("pace"), List.of("slow", "medium", "fast", "unknown"));
        validEnum(query.get("complexity"), List.of("low", "medium", "high", "unknown"));

        List<Movie> filtered = MovieCatalog.movies().stream()
            .filter(movie -> matchesGenre(movie, query.get("genre")))
            .filter(movie -> matchesValue(movie.getPace(), query.get("pace")))
            .filter(movie -> matchesValue(movie.getComplexity(), query.get("complexity")))
            .toList();
        List<Map<String, Object>> items = page(filtered, offset, limit).stream()
            .map(JsonViews::movieJson)
            .toList();

        json(exchange, 200, Map.of(
            "total", filtered.size(),
            "offset", offset,
            "limit", limit,
            "items", items
        ));
    }

    public static void movie(HttpExchange exchange, Map<String, String> query) throws IOException {
        json(exchange, 200, movieJson(requireMovie(required(query, "id"))));
    }

    public static void similarRecommendations(HttpExchange exchange, Map<String, String> query) throws IOException {
        String sourceId = required(query, "id");
        int minScore = intParam(query, "min_score", 0);
        int limit = intParam(query, "limit", 10);
        validPage(limit, 0);
        if (minScore < 0 || minScore > 11) {
            throw new ApiException(400, "min_score deve estar entre 0 e 11");
        }

        Movie source = requireMovie(sourceId);
        List<SimilarityRecommendation> recommendations = MovieCatalog.movies().stream()
            .filter(movie -> !movie.getId().equals(source.getId()))
            .map(movie -> new SimilarityRecommendation(movie, similarityScore(source, movie)))
            .filter(recommendation -> recommendation.score() >= minScore)
            .sorted(Comparator.comparingInt(SimilarityRecommendation::score).reversed()
                .thenComparing(recommendation -> recommendation.movie().getId()))
            .toList();
        List<Map<String, Object>> items = page(recommendations, 0, limit).stream()
            .map(recommendation -> Map.<String, Object>of(
                "score", recommendation.score(),
                "movie", movieJson(recommendation.movie())
            ))
            .toList();

        json(exchange, 200, Map.of("source_id", sourceId, "total", recommendations.size(), "items", items));
    }

    public static int similarityScore(Movie left, Movie right) {
        return overlapScore(left.getGenres(), right.getGenres(), 4)
            + overlapScore(left.getDirectors(), right.getDirectors(), 3)
            + overlapScore(left.getWriters(), right.getWriters(), 2)
            + overlapScore(left.getCountries(), right.getCountries(), 1)
            + overlapScore(left.getLanguages(), right.getLanguages(), 1);
    }

    public static int overlapScore(Iterable<String> left, Iterable<String> right, int weight) {
        for (String leftValue : left) {
            for (String rightValue : right) {
                if (leftValue.equals(rightValue)) {
                    return weight;
                }
            }
        }
        return 0;
    }

    public static Movie requireMovie(String id) {
        return MovieCatalog.movies().stream()
            .filter(movie -> movie.getId().equals(id))
            .findFirst()
            .orElseThrow(() -> new ApiException(404, "Filme não encontrado"));
    }

    public static boolean matchesGenre(Movie movie, String genre) {
        return genre == null || movie.getGenres().contains(genre);
    }

    public static boolean matchesValue(String actual, String expected) {
        return expected == null || expected.equals(actual);
    }

    record SimilarityRecommendation(Movie movie, int score) {
    }
}
