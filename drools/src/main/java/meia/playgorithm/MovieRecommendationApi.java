package meia.playgorithm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import meia.playgorithm.facts.Attribute;
import meia.playgorithm.facts.Limit;
import meia.playgorithm.facts.Movie;
import meia.playgorithm.facts.SimilarityScore;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.Executors;

public class MovieRecommendationApi {

    private static final ObjectMapper JSON = new ObjectMapper();
    private static final DroolsRecommendationService SERVICE = new DroolsRecommendationService();
    private static KnowledgeBaseResult catalog;

    /** The knowledge base over the CSV catalogs, run once. */
    private static synchronized KnowledgeBaseResult catalog() {
        if (catalog == null) {
            catalog = SERVICE.runCatalogs();
        }
        return catalog;
    }

    public static void main(String[] args) throws IOException {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/", MovieRecommendationApi::route);
        server.setExecutor(Executors.newFixedThreadPool(8));
        server.start();

        System.out.println("Playgorithm Drools API running on http://localhost:" + port);
        System.out.println("Swagger docs available at http://localhost:" + port + "/docs");
    }

    private static void route(HttpExchange exchange) throws IOException {
        try {
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();
            Map<String, String> query = query(exchange);

            if ("OPTIONS".equals(method)) {
                json(exchange, 200, Map.of("status", "ok"));
            } else if ("GET".equals(method) && ("/api/health".equals(path) || "/health".equals(path))) {
                health(exchange);
            } else if ("GET".equals(method) && ("/api/filmes".equals(path) || "/api/facts".equals(path) || "/movies".equals(path) || "/facts".equals(path))) {
                movies(exchange, query);
            } else if ("GET".equals(method) && "/api/filme".equals(path)) {
                movie(exchange, query);
            } else if ("GET".equals(method) && "/api/recomendacoes".equals(path)) {
                similarRecommendations(exchange, query);
            } else if ("GET".equals(method) && "/api/recomendacoes_utilizador".equals(path)) {
                userRecommendations(exchange, query);
            } else if ("GET".equals(method) && "/api/how".equals(path)) {
                how(exchange, query);
            } else if ("GET".equals(method) && ("/api/why-not".equals(path) || "/api/why_not".equals(path))) {
                whyNot(exchange, query);
            } else if ("GET".equals(method) && "/api/trace".equals(path)) {
                trace(exchange, query);
            } else if ("POST".equals(method) && "/recommendations".equals(path)) {
                recommendations(exchange);
            } else if ("POST".equals(method) && "/how".equals(path)) {
                how(exchange);
            } else if ("POST".equals(method) && "/why-not".equals(path)) {
                whyNot(exchange);
            } else if ("POST".equals(method) && "/trace".equals(path)) {
                trace(exchange);
            } else if ("GET".equals(method) && "/openapi.json".equals(path)) {
                openApi(exchange);
            } else if ("GET".equals(method) && "/".equals(path)) {
                exchange.getResponseHeaders().set("Location", "/docs");
                exchange.sendResponseHeaders(302, -1);
            } else if ("GET".equals(method) && "/docs".equals(path)) {
                html(exchange, swaggerUi());
            } else if (path.startsWith("/api/")) {
                json(exchange, 405, Map.of("error", "method_not_allowed"));
            } else {
                json(exchange, 404, Map.of("error", "Route not found"));
            }
        } catch (ApiException exception) {
            json(exchange, exception.status(), Map.of("error", exception.getMessage()));
        } catch (IllegalArgumentException exception) {
            json(exchange, 400, Map.of("error", exception.getMessage()));
        } catch (Exception exception) {
            json(exchange, 500, Map.of("error", "internal_server_error", "detail", exception.getMessage()));
        } finally {
            exchange.close();
        }
    }

    private static void health(HttpExchange exchange) throws IOException {
        json(exchange, 200, Map.of("status", "ok"));
    }

    private static void movies(HttpExchange exchange, Map<String, String> query) throws IOException {
        int limit = intParam(query, "limit", 20);
        int offset = intParam(query, "offset", 0);
        validPage(limit, offset);
        validEnum(query.get("pace"), List.of("slow", "medium", "fast", "unknown"));
        validEnum(query.get("complexity"), List.of("low", "medium", "high", "unknown"));

        KnowledgeBaseResult knowledgeBase = catalog();
        List<Movie> filtered = knowledgeBase.movies().stream()
            .filter(movie -> matchesGenre(movie, query.get("genre")))
            .filter(movie -> matchesValue(knowledgeBase.feature(movie.id(), Attribute.PACE).orElse(null), query.get("pace")))
            .filter(movie -> matchesValue(knowledgeBase.feature(movie.id(), Attribute.COMPLEXITY).orElse(null), query.get("complexity")))
            .toList();
        List<Map<String, Object>> items = page(filtered, offset, limit).stream()
            .map(movie -> movieJson(knowledgeBase, movie))
            .toList();

        json(exchange, 200, Map.of(
            "total", filtered.size(),
            "offset", offset,
            "limit", limit,
            "items", items
        ));
    }

    private static void movie(HttpExchange exchange, Map<String, String> query) throws IOException {
        json(exchange, 200, movieJson(catalog(), requireMovie(required(query, "id"))));
    }

    private static void similarRecommendations(HttpExchange exchange, Map<String, String> query) throws IOException {
        String sourceId = required(query, "id");
        int minScore = intParam(query, "min_score", 0);
        int limit = intParam(query, "limit", 10);
        validPage(limit, 0);
        if (minScore < 0 || minScore > 11) {
            throw new ApiException(400, "min_score deve estar entre 0 e 11");
        }

        requireMovie(sourceId);
        KnowledgeBaseResult knowledgeBase = catalog();
        // SimilarityScore facts of the "Similarity score" rule, best score first.
        List<SimilarityScore> recommendations = knowledgeBase.similarTo(sourceId).stream()
            .filter(similarity -> similarity.score() >= minScore)
            .sorted(Comparator.comparingInt(SimilarityScore::score).reversed().thenComparing(SimilarityScore::movieB))
            .toList();
        List<Map<String, Object>> items = page(recommendations, 0, limit).stream()
            .map(similarity -> Map.<String, Object>of(
                "score", similarity.score(),
                "movie", movieJson(knowledgeBase, requireMovie(similarity.movieB()))
            ))
            .toList();

        json(exchange, 200, Map.of("source_id", sourceId, "total", recommendations.size(), "items", items));
    }

    private static void userRecommendations(HttpExchange exchange, Map<String, String> query) throws IOException {
        String userId = required(query, "user_id");
        int limit = intParam(query, "limit", 10);
        int offset = intParam(query, "offset", 0);
        validPage(limit, offset);
        RecommendationResult result = userRun(query);
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

    private static void how(HttpExchange exchange, Map<String, String> query) throws IOException {
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

    private static void whyNot(HttpExchange exchange, Map<String, String> query) throws IOException {
        RecommendationResult result = userRun(query);
        Movie movie = result.findMovie(required(query, "movie"))
            .orElseThrow(() -> new ApiException(404, "Filme não encontrado"));
        if (result.findRecommendation(movie.id()).isPresent()) {
            json(exchange, 200, Map.of(
                "explanation_type", "why_not",
                "movie", movieJson(result.knowledgeBase(), movie),
                "conclusion", "The movie was recommended, so there is no rejection path. Use /api/how for the inference path.",
                "trace", result.traceFor(movie)
            ));
            return;
        }

        List<TraceEvent> trace = result.traceFor(movie);
        List<Map<String, Object>> exclusions = trace.stream()
            .filter(event -> event.type().equals("EXCLUSION"))
            .map(MovieRecommendationApi::traceJson)
            .toList();
        json(exchange, 200, Map.of(
            "explanation_type", "why_not",
            "movie", movieJson(result.knowledgeBase(), movie),
            "conclusion", "The movie was excluded by the rules in the exclusions list.",
            "exclusions", exclusions,
            "trace", trace.stream().map(MovieRecommendationApi::traceJson).toList()
        ));
    }

    private static void trace(HttpExchange exchange, Map<String, String> query) throws IOException {
        RecommendationResult result = userRun(query);
        if (query.containsKey("movie")) {
            json(exchange, 200, result.traceFor(query.get("movie")).stream().map(MovieRecommendationApi::traceJson).toList());
            return;
        }
        json(exchange, 200, result.traceEvents().stream().map(MovieRecommendationApi::traceJson).toList());
    }

    private static void how(HttpExchange exchange) throws IOException {
        RecommendationRequest request = read(exchange.getRequestBody(), RecommendationRequest.class);
        RecommendationResult result = requestRun(request);
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

    private static void whyNot(HttpExchange exchange) throws IOException {
        RecommendationRequest request = read(exchange.getRequestBody(), RecommendationRequest.class);
        Map<String, String> query = Map.of("movie", requiredMovieQuery(request));
        RecommendationResult result = requestRun(request);
        Movie movie = result.findMovie(query.get("movie"))
            .orElseThrow(() -> new ApiException(404, "Filme não encontrado"));
        List<TraceEvent> trace = result.traceFor(movie);
        json(exchange, 200, Map.of(
            "explanation_type", "why_not",
            "movie", movieJson(result.knowledgeBase(), movie),
            "exclusions", trace.stream().filter(event -> event.type().equals("EXCLUSION")).map(MovieRecommendationApi::traceJson).toList(),
            "trace", trace.stream().map(MovieRecommendationApi::traceJson).toList()
        ));
    }

    private static void trace(HttpExchange exchange) throws IOException {
        RecommendationRequest request = read(exchange.getRequestBody(), RecommendationRequest.class);
        RecommendationResult result = requestRun(request);
        List<TraceEvent> trace = request.movie() == null || request.movie().isBlank()
            ? result.traceEvents()
            : result.traceFor(request.movie());
        json(exchange, 200, trace.stream().map(MovieRecommendationApi::traceJson).toList());
    }

    private static void recommendations(HttpExchange exchange) throws IOException {
        RecommendationRequest request = read(exchange.getRequestBody(), RecommendationRequest.class);
        RecommendationResult result = requestRun(request);
        json(exchange, 200, Map.of(
            "movieFacts", result.movies().size(),
            "recommendations", result.recommendations().stream()
                .map(recommendation -> recommendationJson(recommendation, result))
                .toList(),
            "traceEvents", result.traceEvents().stream().map(MovieRecommendationApi::traceJson).toList()
        ));
    }

    private static RecommendationResult userRun(Map<String, String> query) {
        String userId = required(query, "user_id");
        KnowledgeBaseResult knowledgeBase = catalog();
        if (knowledgeBase.user(userId).isEmpty()) {
            throw new ApiException(404, "Utilizador não encontrado");
        }
        return knowledgeBase.forUser(userId);
    }

    /** Runs the knowledge base for the profile sent in a POST request. */
    private static RecommendationResult requestRun(RecommendationRequest request) {
        UserProfile profile = toProfile(request);
        return SERVICE.run(SampleMovieCatalog.movies(), List.of(profile)).forUser(profile.id());
    }

    private static Map<String, Object> recommendationJson(Recommendation recommendation, RecommendationResult result) {
        Movie movie = result.findMovie(recommendation.getMovieId())
            .orElseThrow(() -> new ApiException(404, "Filme não encontrado"));
        return Map.of(
            "score", recommendation.getScore(),
            "reasons", recommendation.getReasons().stream().map(MovieRecommendationApi::reasonJson).toList(),
            "movie", movieJson(result.knowledgeBase(), movie),
            "status", recommendation.getStatus(),
            "satisfied_requirements", List.of(),
            "unmet_preferences", recommendation.getUnmetPreferences().stream().map(MovieRecommendationApi::unmetJson).toList(),
            "score_breakdown", recommendation.getScoreBreakdown()
        );
    }

    private static Map<String, Object> howJson(Recommendation recommendation, RecommendationResult result) {
        Movie movie = result.findMovie(recommendation.getMovieId())
            .orElseThrow(() -> new ApiException(404, "Filme não encontrado"));
        return Map.of(
            "explanation_type", "how",
            "movie", movieJson(result.knowledgeBase(), movie),
            "conclusion", "The movie was inferred as a recommendation.",
            "reasons", recommendation.getReasons().stream().map(MovieRecommendationApi::reasonJson).toList(),
            "unmet_preferences", recommendation.getUnmetPreferences().stream().map(MovieRecommendationApi::unmetJson).toList(),
            "score_breakdown", recommendation.getScoreBreakdown(),
            "trace", result.traceFor(recommendation.getMovieId()).stream().map(MovieRecommendationApi::traceJson).toList()
        );
    }

    private static Map<String, Object> movieJson(KnowledgeBaseResult knowledgeBase, Movie movie) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", movie.id());
        map.put("title", movie.title());
        map.put("year", movie.year());
        map.put("vote", movie.votes());
        map.put("duration", movie.minutes());
        map.put("rating_mpa", emptyToNull(movie.ratingMpa()));
        map.put("rating_imdb", movie.rating());
        map.put("budget", null);
        map.put("win", null);
        map.put("nomination", null);
        map.put("oscar", null);
        for (Attribute feature : List.of(Attribute.PACE, Attribute.COMPLEXITY, Attribute.VIOLENCE, Attribute.HUMOR,
            Attribute.AUDIENCE, Attribute.PSYCHOLOGICAL_INTENSITY)) {
            map.put(feature.key(), knowledgeBase.feature(movie.id(), feature).orElse(null));
        }
        map.put("director", movie.directors());
        map.put("writer", movie.writers());
        map.put("star", movie.stars());
        map.put("genre", movie.genres());
        map.put("country_origin", movie.countries());
        map.put("filming_location", List.of());
        map.put("production_company", movie.companies());
        map.put("language", movie.languages());
        map.put("emotional_tone", knowledgeBase.features(movie.id(), Attribute.EMOTIONAL_TONE));
        map.put("themes", knowledgeBase.features(movie.id(), Attribute.THEMES));
        map.put("subgenre", knowledgeBase.features(movie.id(), Attribute.SUBGENRE));
        return map;
    }

    private static Map<String, Object> reasonJson(String reason) {
        int start = reason.indexOf('(');
        int end = reason.endsWith(")") ? reason.length() - 1 : -1;
        if (start > 0 && end > start) {
            return Map.of("type", reason.substring(0, start), "value", reason.substring(start + 1, end));
        }
        return Map.of("type", reason);
    }

    private static Map<String, Object> unmetJson(String value) {
        return Map.of("type", value.replace(' ', '_'), "arguments", List.of());
    }

    private static Map<String, Object> traceJson(TraceEvent event) {
        return Map.of(
            "type", event.type(),
            "rule", event.rule(),
            "movie_id", event.movieId(),
            "movie_title", event.movieTitle(),
            "details", event.details()
        );
    }

    private static Movie requireMovie(String id) {
        return catalog().movie(id)
            .orElseThrow(() -> new ApiException(404, "Filme não encontrado"));
    }

    private static boolean matchesGenre(Movie movie, String genre) {
        return genre == null || movie.genres().contains(genre);
    }

    private static boolean matchesValue(String actual, String expected) {
        return expected == null || expected.equals(actual);
    }

    private static void validEnum(String value, List<String> allowed) {
        if (value != null && !allowed.contains(value)) {
            throw new ApiException(400, "Valor de classificação inválido");
        }
    }

    private static void validPage(int limit, int offset) {
        if (limit < 1 || limit > 100 || offset < 0) {
            throw new ApiException(400, "limit: 1 a 100; offset: maior ou igual a 0");
        }
    }

    private static <T> List<T> page(List<T> values, int offset, int limit) {
        if (offset >= values.size()) {
            return List.of();
        }
        return values.subList(offset, Math.min(values.size(), offset + limit));
    }

    private static String required(Map<String, String> query, String name) {
        String value = query.get(name);
        if (value == null || value.isBlank()) {
            throw new ApiException(400, "Parâmetro obrigatório: " + name);
        }
        return value;
    }

    private static int intParam(Map<String, String> query, String name, int fallback) {
        String value = query.get(name);
        if (value == null || value.isBlank()) {
            return fallback;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ignored) {
            throw new ApiException(400, "Parâmetro inválido");
        }
    }

    private static Map<String, String> query(HttpExchange exchange) {
        Map<String, String> values = new LinkedHashMap<>();
        String rawQuery = exchange.getRequestURI().getRawQuery();
        if (rawQuery == null || rawQuery.isBlank()) {
            return values;
        }
        for (String pair : rawQuery.split("&")) {
            String[] parts = pair.split("=", 2);
            String key = decode(parts[0]);
            String value = parts.length > 1 ? decode(parts[1]) : "";
            values.put(key, value);
        }
        return values;
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private static String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    /** Builds the same user facts as a CSV row (see SampleUserCatalog). */
    private static UserProfile toProfile(RecommendationRequest request) {
        UserProfile.Builder profile = UserProfile.builder(valueOrDefault(request.userId(), "api-user"), request.age());

        addAll(request.watchedMovieIds(), movieId -> profile.watched(movieId, 0));
        addAll(request.wishlistMovieIds(), profile::wishlist);
        addAll(request.likedGenres(), genre -> profile.likes(Attribute.GENRE, genre));
        addAll(request.dislikedGenres(), genre -> profile.dislikes(Attribute.GENRE, genre));
        addAll(request.likedLanguages(), language -> profile.likes(Attribute.LANGUAGE, language));
        addAll(request.dislikedLanguages(), language -> profile.dislikes(Attribute.LANGUAGE, language));
        addAll(request.preferredDirectors(), value -> profile.prefers(Attribute.DIRECTOR, value));
        addAll(request.preferredWriters(), value -> profile.prefers(Attribute.WRITER, value));
        addAll(request.preferredStars(), value -> profile.prefers(Attribute.STAR, value));
        addAll(request.preferredCountries(), value -> profile.prefers(Attribute.COUNTRY_ORIGIN, value));
        addAll(request.preferredSubgenres(), value -> profile.prefers(Attribute.SUBGENRE, value));
        addAll(request.preferredPace(), value -> profile.prefers(Attribute.PACE, value));
        addAll(request.preferredComplexity(), value -> profile.prefers(Attribute.COMPLEXITY, value));
        addAll(request.preferredViolence(), value -> profile.prefers(Attribute.VIOLENCE, value));
        addAll(request.preferredHumor(), value -> profile.prefers(Attribute.HUMOR, value));
        addAll(request.preferredPsychologicalIntensity(), value -> profile.prefers(Attribute.PSYCHOLOGICAL_INTENSITY, value));
        addAll(request.preferredEmotionalTones(), value -> profile.prefers(Attribute.EMOTIONAL_TONE, value));
        addAll(request.preferredThemes(), value -> profile.prefers(Attribute.THEMES, value));
        addAll(request.preferredAudience(), value -> profile.prefers(Attribute.AUDIENCE, value));
        addAll(request.preferredEras(), value -> profile.prefers(Attribute.ERA, value));
        addAll(request.preferredPopularity(), value -> profile.prefers(Attribute.POPULARITY, value));

        addAll(request.requiredLanguages(), value -> profile.limit(Limit.REQUIRED_LANGUAGES, value));
        addAll(request.dislikedDirectors(), value -> profile.limit(Limit.DISLIKED_DIRECTORS, value));
        addAll(request.dislikedStars(), value -> profile.limit(Limit.DISLIKED_STARS, value));
        addLimit(profile, Limit.SESSION_MIN_AGE, request.sessionMinimumAge());
        addLimit(profile, Limit.MAX_DURATION_MINUTES, request.maximumDurationMinutes());
        addLimit(profile, Limit.YEAR_FROM, request.yearFrom());
        addLimit(profile, Limit.YEAR_TO, request.yearTo());
        addLimit(profile, Limit.MIN_RATING, request.minimumRating());
        addLimit(profile, Limit.RATING_TOLERANCE, request.ratingTolerance());
        addLimit(profile, Limit.RATING_REQUIRED, request.ratingRequired());
        addLimit(profile, Limit.ALLOW_REWATCH, request.allowRewatch());
        return profile.build();
    }

    private static void addLimit(UserProfile.Builder profile, Limit limit, Object value) {
        if (value != null) {
            profile.limit(limit, value.toString());
        }
    }

    private static String requiredMovieQuery(RecommendationRequest request) {
        if (request.movie() == null || request.movie().isBlank()) {
            throw new IllegalArgumentException("Field 'movie' is required for explanation routes.");
        }
        return request.movie();
    }

    private static <T> T read(InputStream body, Class<T> type) throws IOException {
        return JSON.readValue(body, type);
    }

    private static void addAll(List<String> values, PreferenceSetter setter) {
        if (values != null) {
            values.forEach(setter::add);
        }
    }

    private static String valueOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static void json(HttpExchange exchange, int status, Object body) throws IOException {
        byte[] bytes = JSON.writerWithDefaultPrettyPrinter().writeValueAsBytes(body);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        send(exchange, status, bytes);
    }

    private static void html(HttpExchange exchange, String body) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "text/html; charset=utf-8");
        send(exchange, 200, body.getBytes(StandardCharsets.UTF_8));
    }

    private static void send(HttpExchange exchange, int status, byte[] bytes) throws IOException {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream output = exchange.getResponseBody()) {
            output.write(bytes);
        }
    }

    /** The OpenAPI description (parameters, bodies and responses) that Swagger UI reads at /docs. */
    private static void openApi(HttpExchange exchange) throws IOException {
        try (InputStream input = MovieRecommendationApi.class.getResourceAsStream("/meia/playgorithm/openapi.json")) {
            if (input == null) {
                throw new IllegalStateException("Missing openapi.json");
            }
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
            send(exchange, 200, input.readAllBytes());
        }
    }

    private static String swaggerUi() {
        return """
            <!doctype html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <title>Playgorithm Drools API Docs</title>
              <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
            </head>
            <body>
              <div id="swagger-ui"></div>
              <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
              <script>
                window.ui = SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger-ui' });
              </script>
            </body>
            </html>
            """;
    }

    private record RecommendationRequest(
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
        List<String> preferredPopularity
    ) {
    }

    private static final class ApiException extends RuntimeException {
        private final int status;

        private ApiException(int status, String message) {
            super(message);
            this.status = status;
        }

        private int status() {
            return status;
        }
    }

    @FunctionalInterface
    private interface PreferenceSetter {
        void add(String value);
    }
}
