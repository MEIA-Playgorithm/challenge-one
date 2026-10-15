package meia.playgorithm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

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
            } else if ("POST".equals(method) && path.matches("/api/reload(/users|/movies)?")) {
                // Os catálogos são lidos do CSV a cada pedido, por isso não há nada a recarregar.
                json(exchange, 200, Map.of("status", "ok"));
            } else if ("POST".equals(method) && "/recommendations".equals(path)) {
                recommendations(exchange);
            } else if ("POST".equals(method) && "/how".equals(path)) {
                how(exchange);
            } else if ("POST".equals(method) && "/why-not".equals(path)) {
                whyNot(exchange);
            } else if ("POST".equals(method) && "/trace".equals(path)) {
                trace(exchange);
            } else if ("GET".equals(method) && "/openapi.json".equals(path)) {
                json(exchange, 200, openApi());
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

        List<Movie> filtered = SampleMovieCatalog.movies().stream()
            .filter(movie -> matchesGenre(movie, query.get("genre")))
            .filter(movie -> matchesValue(movie.getPace(), query.get("pace")))
            .filter(movie -> matchesValue(movie.getComplexity(), query.get("complexity")))
            .toList();
        List<Map<String, Object>> items = page(filtered, offset, limit).stream()
            .map(MovieRecommendationApi::movieJson)
            .toList();

        json(exchange, 200, Map.of(
            "total", filtered.size(),
            "offset", offset,
            "limit", limit,
            "items", items
        ));
    }

    private static void movie(HttpExchange exchange, Map<String, String> query) throws IOException {
        json(exchange, 200, movieJson(requireMovie(required(query, "id"))));
    }

    private static void similarRecommendations(HttpExchange exchange, Map<String, String> query) throws IOException {
        String sourceId = required(query, "id");
        int minScore = intParam(query, "min_score", 0);
        int limit = intParam(query, "limit", 10);
        validPage(limit, 0);
        if (minScore < 0 || minScore > 11) {
            throw new ApiException(400, "min_score deve estar entre 0 e 11");
        }

        Movie source = requireMovie(sourceId);
        List<SimilarityRecommendation> recommendations = SampleMovieCatalog.movies().stream()
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

    private static void userRecommendations(HttpExchange exchange, Map<String, String> query) throws IOException {
        String userId = required(query, "user_id");
        int limit = intParam(query, "limit", 10);
        int offset = intParam(query, "offset", 0);
        validPage(limit, offset);
        UserPreferences preferences = SampleUserCatalog.find(userId)
            .orElseThrow(() -> new ApiException(404, "Utilizador não encontrado"));
        RecommendationResult result = SERVICE.evaluate(preferences, SampleMovieCatalog.movies());
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
            .map(MovieRecommendationApi::traceJson)
            .toList();
        json(exchange, 200, Map.of(
            "explanation_type", "why_not",
            "movie", movieJson(movie),
            "conclusion", exclusions.isEmpty()
                ? "The movie was not recommended because no positive preference path produced a recommendation."
                : "The movie was discarded by mandatory or rejection rules.",
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
        RecommendationResult result = SERVICE.evaluate(toPreferences(request), SampleMovieCatalog.movies());
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
        RecommendationResult result = SERVICE.evaluate(toPreferences(request), SampleMovieCatalog.movies());
        Movie movie = result.findMovie(query.get("movie"))
            .orElseThrow(() -> new ApiException(404, "Filme não encontrado"));
        List<TraceEvent> trace = result.traceFor(movie);
        json(exchange, 200, Map.of(
            "explanation_type", "why_not",
            "movie", movieJson(movie),
            "exclusions", trace.stream().filter(event -> event.type().equals("EXCLUSION")).map(MovieRecommendationApi::traceJson).toList(),
            "trace", trace.stream().map(MovieRecommendationApi::traceJson).toList()
        ));
    }

    private static void trace(HttpExchange exchange) throws IOException {
        RecommendationRequest request = read(exchange.getRequestBody(), RecommendationRequest.class);
        RecommendationResult result = SERVICE.evaluate(toPreferences(request), SampleMovieCatalog.movies());
        List<TraceEvent> trace = request.movie() == null || request.movie().isBlank()
            ? result.traceEvents()
            : result.traceFor(request.movie());
        json(exchange, 200, trace.stream().map(MovieRecommendationApi::traceJson).toList());
    }

    private static void recommendations(HttpExchange exchange) throws IOException {
        RecommendationRequest request = read(exchange.getRequestBody(), RecommendationRequest.class);
        RecommendationResult result = SERVICE.evaluate(toPreferences(request), SampleMovieCatalog.movies());
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
        UserPreferences preferences = SampleUserCatalog.find(userId)
            .orElseThrow(() -> new ApiException(404, "Utilizador não encontrado"));
        return SERVICE.evaluate(preferences, SampleMovieCatalog.movies());
    }

    private static Map<String, Object> recommendationJson(Recommendation recommendation, RecommendationResult result) {
        Movie movie = result.findMovie(recommendation.getMovieId())
            .orElseThrow(() -> new ApiException(404, "Filme não encontrado"));
        return Map.of(
            "score", recommendation.getScore(),
            "reasons", recommendation.getReasons().stream().map(MovieRecommendationApi::reasonJson).toList(),
            "movie", movieJson(movie),
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
            "movie", movieJson(movie),
            "conclusion", "The movie was inferred as a recommendation.",
            "reasons", recommendation.getReasons().stream().map(MovieRecommendationApi::reasonJson).toList(),
            "unmet_preferences", recommendation.getUnmetPreferences().stream().map(MovieRecommendationApi::unmetJson).toList(),
            "score_breakdown", recommendation.getScoreBreakdown(),
            "trace", result.traceFor(recommendation.getMovieId()).stream().map(MovieRecommendationApi::traceJson).toList()
        );
    }

    private static Map<String, Object> movieJson(Movie movie) {
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

    private static int similarityScore(Movie left, Movie right) {
        return overlapScore(left.getGenres(), right.getGenres(), 4)
            + overlapScore(left.getDirectors(), right.getDirectors(), 3)
            + overlapScore(left.getWriters(), right.getWriters(), 2)
            + overlapScore(left.getCountries(), right.getCountries(), 1)
            + overlapScore(left.getLanguages(), right.getLanguages(), 1);
    }

    private static int overlapScore(Iterable<String> left, Iterable<String> right, int weight) {
        for (String leftValue : left) {
            for (String rightValue : right) {
                if (leftValue.equals(rightValue)) {
                    return weight;
                }
            }
        }
        return 0;
    }

    private static Movie requireMovie(String id) {
        return SampleMovieCatalog.movies().stream()
            .filter(movie -> movie.getId().equals(id))
            .findFirst()
            .orElseThrow(() -> new ApiException(404, "Filme não encontrado"));
    }

    private static boolean matchesGenre(Movie movie, String genre) {
        return genre == null || movie.getGenres().contains(genre);
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

    private static UserPreferences toPreferences(RecommendationRequest request) {
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

    private static int valueOrDefault(Integer value, int fallback) {
        return value == null ? fallback : value;
    }

    private static double valueOrDefault(Double value, double fallback) {
        return value == null ? fallback : value;
    }

    private static boolean valueOrDefault(Boolean value, boolean fallback) {
        return value == null ? fallback : value;
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

    private static Map<String, Object> openApi() {
        return Map.of(
            "openapi", "3.0.3",
            "info", Map.of("title", "Playgorithm Drools Recommendation API", "version", "1.0.0"),
            "paths", Map.ofEntries(
                Map.entry("/api/health", Map.of("get", Map.of("summary", "Check API health"))),
                Map.entry("/api/filmes", Map.of("get", Map.of("summary", "List movie facts with Prolog-compatible pagination and filters"))),
                Map.entry("/api/filme", Map.of("get", Map.of("summary", "Read one movie by id"))),
                Map.entry("/api/recomendacoes", Map.of("get", Map.of("summary", "List similar movies for a source movie"))),
                Map.entry("/api/recomendacoes_utilizador", Map.of("get", Map.of("summary", "List recommendations for a CSV user profile"))),
                Map.entry("/api/how", Map.of("get", Map.of("summary", "Explain how a recommendation was inferred"))),
                Map.entry("/api/why-not", Map.of("get", Map.of("summary", "Explain why a movie was not recommended"))),
                Map.entry("/api/why_not", Map.of("get", Map.of("summary", "Alias for /api/why-not"))),
                Map.entry("/api/trace", Map.of("get", Map.of("summary", "Return trace events")))
            )
        );
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

    private record SimilarityRecommendation(Movie movie, int score) {
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
        List<String> preferredPopularity,
        List<String> mandatoryGenres,
        List<String> mandatoryDirectors,
        List<String> mandatoryStars
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
