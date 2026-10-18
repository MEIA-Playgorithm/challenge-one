package meia.playgorithm.service;

import java.util.List;
import meia.playgorithm.api.dto.HowDto;
import meia.playgorithm.api.dto.MovieDto;
import meia.playgorithm.api.dto.ReasonDto;
import meia.playgorithm.api.dto.RecommendationDto;
import meia.playgorithm.api.dto.UnmetDto;
import meia.playgorithm.api.dto.UserRecommendationsDto;
import meia.playgorithm.api.dto.WhyNotDto;
import meia.playgorithm.catalog.MovieCatalog;
import meia.playgorithm.catalog.UserCatalog;
import meia.playgorithm.engine.DroolsRecommendationService;
import meia.playgorithm.model.Movie;
import meia.playgorithm.model.Recommendation;
import meia.playgorithm.model.RecommendationResult;
import meia.playgorithm.model.TraceEvent;
import meia.playgorithm.model.UserPreferences;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** Recomendações para um utilizador do CSV e as explicações de como o motor chegou a elas. */
@Service
public class RecommendationService {

    private final MovieCatalog movies;
    private final UserCatalog users;
    private final DroolsRecommendationService engine;

    public RecommendationService(MovieCatalog movies, UserCatalog users, DroolsRecommendationService engine) {
        this.movies = movies;
        this.users = users;
        this.engine = engine;
    }

    public UserRecommendationsDto forUser(String userId, int limit, int offset) {
        RecommendationResult result = run(userId);
        List<Recommendation> all = result.recommendations();
        List<RecommendationDto> items = Pages.slice(all, offset, limit).stream()
            .map(recommendation -> RecommendationDto.of(recommendation, movieOf(recommendation, result)))
            .toList();
        return new UserRecommendationsDto(userId, all.size(), offset, limit, items);
    }

    public HowDto how(String userId, String movieQuery) {
        RecommendationResult result = run(userId);
        Recommendation recommendation = result.findRecommendation(movieQuery).orElse(null);
        if (recommendation == null) {
            return new HowDto("how", movieQuery,
                "No recommendation conclusion was produced for this movie. Use /api/why-not to inspect the rejection path.",
                null, null, null, result.traceFor(movieQuery));
        }
        return new HowDto("how", MovieDto.of(movieOf(recommendation, result)),
            "The movie was inferred as a recommendation.",
            recommendation.getReasons().stream().map(ReasonDto::of).toList(),
            recommendation.getUnmetPreferences().stream().map(UnmetDto::of).toList(),
            recommendation.getScoreBreakdown(),
            result.traceFor(recommendation.getMovieId()));
    }

    public WhyNotDto whyNot(String userId, String movieQuery) {
        RecommendationResult result = run(userId);
        Movie movie = result.findMovie(movieQuery)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Filme não encontrado"));
        List<TraceEvent> trace = result.traceFor(movie);
        if (result.findRecommendation(movie.getId()).isPresent()) {
            return new WhyNotDto("why_not", MovieDto.of(movie),
                "The movie was recommended, so there is no rejection path. Use /api/how for the inference path.",
                null, trace);
        }
        List<TraceEvent> exclusions = trace.stream().filter(event -> event.type().equals("EXCLUSION")).toList();
        return new WhyNotDto("why_not", MovieDto.of(movie),
            exclusions.isEmpty()
                ? "The movie was not recommended because no positive preference path produced a recommendation."
                : "The movie was discarded by mandatory or rejection rules.",
            exclusions, trace);
    }

    /** Todos os eventos de regras do utilizador, ou só os de um filme se `movieQuery` existir. */
    public List<TraceEvent> trace(String userId, String movieQuery) {
        RecommendationResult result = run(userId);
        return movieQuery == null ? result.traceEvents() : result.traceFor(movieQuery);
    }

    private RecommendationResult run(String userId) {
        UserPreferences preferences = users.find(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizador não encontrado"));
        return engine.evaluate(preferences, movies.movies());
    }

    private static Movie movieOf(Recommendation recommendation, RecommendationResult result) {
        return result.findMovie(recommendation.getMovieId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Filme não encontrado"));
    }
}
