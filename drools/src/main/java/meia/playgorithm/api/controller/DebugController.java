package meia.playgorithm.api.controller;

import meia.playgorithm.api.view.JsonViews;
import meia.playgorithm.api.http.ApiException;
import meia.playgorithm.catalog.MovieCatalog;
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

public final class DebugController {

    private static final DroolsRecommendationService SERVICE = new DroolsRecommendationService();

    public static void how(HttpExchange exchange) throws IOException {
        RecommendationRequest request = read(exchange.getRequestBody(), RecommendationRequest.class);
        RecommendationResult result = SERVICE.evaluate(toPreferences(request), MovieCatalog.movies());
        String movieQuery = requiredMovieQuery(request);
        Optional<Recommendation> recommendation = result.findRecommendation(movieQuery);
        json(exchange, 200, recommendation
            .<Object>map(value -> howJson(value, result))
            .orElseGet(() -> Map.of(
                "explanation_type", "how",
                "movie", movieQuery,
                "conclusion", "No recommendation conclusion was produced for this movie. Use /why-not to inspect the rejection path.",
                "trace", result.traceFor(movieQuery)
            )));
    }

    public static void whyNot(HttpExchange exchange) throws IOException {
        RecommendationRequest request = read(exchange.getRequestBody(), RecommendationRequest.class);
        Map<String, String> query = Map.of("movie", requiredMovieQuery(request));
        RecommendationResult result = SERVICE.evaluate(toPreferences(request), MovieCatalog.movies());
        Movie movie = result.findMovie(query.get("movie"))
            .orElseThrow(() -> new ApiException(404, "Filme não encontrado"));
        List<TraceEvent> trace = result.traceFor(movie);
        json(exchange, 200, Map.of(
            "explanation_type", "why_not",
            "movie", movieJson(movie),
            "exclusions", trace.stream().filter(event -> event.type().equals("EXCLUSION")).map(JsonViews::traceJson).toList(),
            "trace", trace.stream().map(JsonViews::traceJson).toList()
        ));
    }

    public static void trace(HttpExchange exchange) throws IOException {
        RecommendationRequest request = read(exchange.getRequestBody(), RecommendationRequest.class);
        RecommendationResult result = SERVICE.evaluate(toPreferences(request), MovieCatalog.movies());
        List<TraceEvent> trace = request.movie() == null || request.movie().isBlank()
            ? result.traceEvents()
            : result.traceFor(request.movie());
        json(exchange, 200, trace.stream().map(JsonViews::traceJson).toList());
    }

    public static void recommendations(HttpExchange exchange) throws IOException {
        RecommendationRequest request = read(exchange.getRequestBody(), RecommendationRequest.class);
        RecommendationResult result = SERVICE.evaluate(toPreferences(request), MovieCatalog.movies());
        json(exchange, 200, Map.of(
            "movieFacts", result.movies().size(),
            "recommendations", result.recommendations().stream()
                .map(recommendation -> recommendationJson(recommendation, result))
                .toList(),
            "traceEvents", result.traceEvents().stream().map(JsonViews::traceJson).toList()
        ));
    }

    public static UserPreferences toPreferences(RecommendationRequest request) {
        UserPreferences preferences = UserPreferences.forUser(valueOrDefault(request.userId(), "api-user"))
            .withAge(valueOrDefault(request.age(), 18))
            .withSessionMinimumAge(valueOrDefault(request.sessionMinimumAge(), -1))
            .withMaximumDurationMinutes(valueOrDefault(request.maximumDurationMinutes(), -1))
            .withYearFrom(valueOrDefault(request.yearFrom(), Integer.MIN_VALUE))
            .withYearTo(valueOrDefault(request.yearTo(), Integer.MAX_VALUE))
            .withMinimumRating(
                valueOrDefault(request.minimumRating(), -1.0),
                valueOrDefault(request.ratingTolerance(), 0.0),
                valueOrDefault(request.ratingRequired(), false)
            )
            .allowRewatch(valueOrDefault(request.allowRewatch(), false));

        addAll(request.watchedMovieIds(), preferences::addWatchedMovie);
        addAll(request.wishlistMovieIds(), preferences::addWishlistMovie);
        addAll(request.likedGenres(), preferences::addLikedGenre);
        addAll(request.dislikedGenres(), preferences::addDislikedGenre);
        addAll(request.likedLanguages(), preferences::addLikedLanguage);
        addAll(request.dislikedLanguages(), preferences::addDislikedLanguage);
        addAll(request.requiredLanguages(), preferences::addRequiredLanguage);
        addAll(request.preferredDirectors(), preferences::addPreferredDirector);
        addAll(request.dislikedDirectors(), preferences::addDislikedDirector);
        addAll(request.preferredWriters(), preferences::addPreferredWriter);
        addAll(request.preferredStars(), preferences::addPreferredStar);
        addAll(request.dislikedStars(), preferences::addDislikedStar);
        addAll(request.preferredCountries(), preferences::addPreferredCountry);
        addAll(request.preferredSubgenres(), preferences::addPreferredSubgenre);
        addAll(request.preferredPace(), preferences::addPreferredPace);
        addAll(request.preferredComplexity(), preferences::addPreferredComplexity);
        addAll(request.preferredViolence(), preferences::addPreferredViolence);
        addAll(request.preferredHumor(), preferences::addPreferredHumor);
        addAll(request.preferredPsychologicalIntensity(), preferences::addPreferredPsychologicalIntensity);
        addAll(request.preferredEmotionalTones(), preferences::addPreferredEmotionalTone);
        addAll(request.preferredThemes(), preferences::addPreferredTheme);
        addAll(request.preferredAudience(), preferences::addPreferredAudience);
        addAll(request.preferredEras(), preferences::addPreferredEra);
        addAll(request.preferredPopularity(), preferences::addPreferredPopularity);
        addAll(request.mandatoryGenres(), preferences::addMandatoryGenre);
        addAll(request.mandatoryDirectors(), preferences::addMandatoryDirector);
        addAll(request.mandatoryStars(), preferences::addMandatoryStar);
        return preferences;
    }

    public static String requiredMovieQuery(RecommendationRequest request) {
        if (request.movie() == null || request.movie().isBlank()) {
            throw new IllegalArgumentException("Field 'movie' is required for explanation routes.");
        }
        return request.movie();
    }

    public static void addAll(List<String> values, PreferenceSetter setter) {
        if (values != null) {
            values.forEach(setter::add);
        }
    }

    public static String valueOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    public static int valueOrDefault(Integer value, int fallback) {
        return value == null ? fallback : value;
    }

    public static double valueOrDefault(Double value, double fallback) {
        return value == null ? fallback : value;
    }

    public static boolean valueOrDefault(Boolean value, boolean fallback) {
        return value == null ? fallback : value;
    }

    record RecommendationRequest(
        String userId,
        String movie,
        Integer age,
        Integer sessionMinimumAge,
        Integer maximumDurationMinutes,
        Integer yearFrom,
        Integer yearTo,
        Double minimumRating,
        Double ratingTolerance,
        Boolean ratingRequired,
        Boolean allowRewatch,
        List<String> watchedMovieIds,
        List<String> wishlistMovieIds,
        List<String> likedGenres,
        List<String> dislikedGenres,
        List<String> likedLanguages,
        List<String> dislikedLanguages,
        List<String> requiredLanguages,
        List<String> preferredDirectors,
        List<String> dislikedDirectors,
        List<String> preferredWriters,
        List<String> preferredStars,
        List<String> dislikedStars,
        List<String> preferredCountries,
        List<String> preferredSubgenres,
        List<String> preferredPace,
        List<String> preferredComplexity,
        List<String> preferredViolence,
        List<String> preferredHumor,
        List<String> preferredPsychologicalIntensity,
        List<String> preferredEmotionalTones,
        List<String> preferredThemes,
        List<String> preferredAudience,
        List<String> preferredEras,
        List<String> preferredPopularity,
        List<String> mandatoryGenres,
        List<String> mandatoryDirectors,
        List<String> mandatoryStars
    ) {
    }

    @FunctionalInterface
    interface PreferenceSetter {
        void add(String value);
    }
}
