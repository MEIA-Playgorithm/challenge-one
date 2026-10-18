package meia.playgorithm.api.view;

import meia.playgorithm.api.http.ApiException;
import meia.playgorithm.model.Movie;
import meia.playgorithm.model.Recommendation;
import meia.playgorithm.model.RecommendationResult;
import meia.playgorithm.model.TraceEvent;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import static meia.playgorithm.api.http.Http.*;

public final class JsonViews {

    public static Map<String, Object> recommendationJson(Recommendation recommendation, RecommendationResult result) {
        Movie movie = result.findMovie(recommendation.getMovieId())
            .orElseThrow(() -> new ApiException(404, "Filme não encontrado"));
        return Map.of(
            "score", recommendation.getScore(),
            "reasons", recommendation.getReasons().stream().map(JsonViews::reasonJson).toList(),
            "movie", movieJson(movie),
            "status", recommendation.getStatus(),
            "satisfied_requirements", List.of(),
            "unmet_preferences", recommendation.getUnmetPreferences().stream().map(JsonViews::unmetJson).toList(),
            "score_breakdown", recommendation.getScoreBreakdown()
        );
    }

    public static Map<String, Object> howJson(Recommendation recommendation, RecommendationResult result) {
        Movie movie = result.findMovie(recommendation.getMovieId())
            .orElseThrow(() -> new ApiException(404, "Filme não encontrado"));
        return Map.of(
            "explanation_type", "how",
            "movie", movieJson(movie),
            "conclusion", "The movie was inferred as a recommendation.",
            "reasons", recommendation.getReasons().stream().map(JsonViews::reasonJson).toList(),
            "unmet_preferences", recommendation.getUnmetPreferences().stream().map(JsonViews::unmetJson).toList(),
            "score_breakdown", recommendation.getScoreBreakdown(),
            "trace", result.traceFor(recommendation.getMovieId()).stream().map(JsonViews::traceJson).toList()
        );
    }

    public static Map<String, Object> movieJson(Movie movie) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", movie.getId());
        map.put("title", movie.getTitle());
        map.put("year", movie.getYear() > 0 ? movie.getYear() : null);
        map.put("vote", null);
        map.put("duration", movie.getDurationMinutes() > 0 ? movie.getDurationMinutes() : null);
        map.put("rating_mpa", emptyToNull(movie.getRatingMpa()));
        map.put("rating_imdb", movie.getRatingImdb() > 0 ? movie.getRatingImdb() : null);
        map.put("budget", null);
        map.put("win", null);
        map.put("nomination", null);
        map.put("oscar", null);
        map.put("pace", emptyToNull(movie.getPace()));
        map.put("complexity", emptyToNull(movie.getComplexity()));
        map.put("violence", emptyToNull(movie.getViolence()));
        map.put("humor", emptyToNull(movie.getHumor()));
        map.put("audience", emptyToNull(movie.getAudience()));
        map.put("psychological_intensity", emptyToNull(movie.getPsychologicalIntensity()));
        map.put("director", List.copyOf(movie.getDirectors()));
        map.put("writer", List.copyOf(movie.getWriters()));
        map.put("star", List.copyOf(movie.getStars()));
        map.put("genre", List.copyOf(movie.getGenres()));
        map.put("country_origin", List.copyOf(movie.getCountries()));
        map.put("filming_location", List.of());
        map.put("production_company", List.of());
        map.put("language", List.copyOf(movie.getLanguages()));
        map.put("emotional_tone", List.copyOf(movie.getEmotionalTones()));
        map.put("themes", List.copyOf(movie.getThemes()));
        map.put("subgenre", List.copyOf(movie.getSubgenres()));
        return map;
    }

    public static Map<String, Object> reasonJson(String reason) {
        int start = reason.indexOf('(');
        int end = reason.endsWith(")") ? reason.length() - 1 : -1;
        if (start > 0 && end > start) {
            return Map.of("type", reason.substring(0, start), "value", reason.substring(start + 1, end));
        }
        return Map.of("type", reason);
    }

    public static Map<String, Object> unmetJson(String value) {
        return Map.of("type", value.replace(' ', '_'), "arguments", List.of());
    }

    public static Map<String, Object> traceJson(TraceEvent event) {
        return Map.of(
            "type", event.type(),
            "rule", event.rule(),
            "movie_id", event.movieId(),
            "movie_title", event.movieTitle(),
            "details", event.details()
        );
    }
}
