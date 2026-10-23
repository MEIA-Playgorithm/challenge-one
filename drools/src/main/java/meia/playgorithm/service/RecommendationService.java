package meia.playgorithm.service;

import java.util.List;
import meia.playgorithm.api.dto.HowDto;
import meia.playgorithm.api.dto.MovieDto;
import meia.playgorithm.api.dto.ReasonDto;
import meia.playgorithm.api.dto.RecommendationDto;
import meia.playgorithm.api.dto.UnmetDto;
import meia.playgorithm.api.dto.UserRecommendationsDto;
import meia.playgorithm.api.dto.WhyNotDto;
import meia.playgorithm.engine.KnowledgeBaseResult;
import meia.playgorithm.engine.RecommendationResult;
import meia.playgorithm.model.Movie;
import meia.playgorithm.model.Recommendation;
import meia.playgorithm.model.TraceEvent;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** Recomendações para um utilizador do CSV e as explicações de como o motor chegou a elas. */
@Service
public class RecommendationService {

    private final KnowledgeBaseService knowledgeBase;

    public RecommendationService(KnowledgeBaseService knowledgeBase) {
        this.knowledgeBase = knowledgeBase;
    }

    public UserRecommendationsDto forUser(String userId, int limit, int offset) {
        RecommendationResult result = run(userId);
        List<Recommendation> all = result.recommendations();
        List<RecommendationDto> items = Pages.slice(all, offset, limit).stream()
            .map(recommendation -> RecommendationDto.of(recommendation, movieDto(recommendation, result)))
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
        return new HowDto("how", movieDto(recommendation, result),
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
        MovieDto movieDto = MovieDto.of(movie, result.knowledgeBase());
        if (result.findRecommendation(movie.id()).isPresent()) {
            return new WhyNotDto("why_not", movieDto,
                "The movie was recommended, so there is no rejection path. Use /api/how for the inference path.",
                null, trace);
        }
        // Um filme só fica de fora quando uma regra de exclusão disparou ("Excluded movie").
        List<TraceEvent> exclusions = trace.stream().filter(event -> event.type().equals("EXCLUSION")).toList();
        return new WhyNotDto("why_not", movieDto,
            "The movie was excluded by the rules in the exclusions list.",
            exclusions, trace);
    }

    /** Todos os eventos de regras do utilizador, ou só os de um filme se `movieQuery` existir. */
    public List<TraceEvent> trace(String userId, String movieQuery) {
        RecommendationResult result = run(userId);
        return movieQuery == null ? result.traceEvents() : result.traceFor(movieQuery);
    }

    private RecommendationResult run(String userId) {
        KnowledgeBaseResult current = knowledgeBase.current();
        if (current.user(userId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizador não encontrado");
        }
        return current.forUser(userId);
    }

    private static MovieDto movieDto(Recommendation recommendation, RecommendationResult result) {
        Movie movie = result.findMovie(recommendation.getMovieId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Filme não encontrado"));
        return MovieDto.of(movie, result.knowledgeBase());
    }
}
