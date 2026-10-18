package meia.playgorithm.api.controller;

import static meia.playgorithm.api.Validation.PAGE;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import meia.playgorithm.api.dto.MovieDto;
import meia.playgorithm.api.dto.PageDto;
import meia.playgorithm.api.dto.SimilarMoviesDto;
import meia.playgorithm.service.MovieService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MovieController {

    private static final String CLASSIFICATION = "Valor de classificação inválido";
    private static final String MIN_SCORE = "min_score deve estar entre 0 e 11";

    private final MovieService movies;

    public MovieController(MovieService movies) {
        this.movies = movies;
    }

    @Operation(summary = "List movie facts with Prolog-compatible pagination and filters")
    @GetMapping("/filmes")
    public PageDto<MovieDto> movies(
        @RequestParam(name = "genre", required = false) String genre,
        @RequestParam(name = "pace", required = false) @Pattern(regexp = "slow|medium|fast|unknown", message = CLASSIFICATION) String pace,
        @RequestParam(name = "complexity", required = false) @Pattern(regexp = "low|medium|high|unknown", message = CLASSIFICATION) String complexity,
        @RequestParam(name = "limit", defaultValue = "20") @Min(value = 1, message = PAGE) @Max(value = 100, message = PAGE) int limit,
        @RequestParam(name = "offset", defaultValue = "0") @Min(value = 0, message = PAGE) int offset
    ) {
        return movies.list(genre, pace, complexity, limit, offset);
    }

    @Operation(summary = "Read one movie by id")
    @GetMapping("/filme")
    public MovieDto movie(@RequestParam("id") String id) {
        return movies.get(id);
    }

    @Operation(summary = "List similar movies for a source movie")
    @GetMapping("/recomendacoes")
    public SimilarMoviesDto similar(
        @RequestParam("id") String id,
        @RequestParam(name = "min_score", defaultValue = "0") @Min(value = 0, message = MIN_SCORE) @Max(value = 11, message = MIN_SCORE) int minScore,
        @RequestParam(name = "limit", defaultValue = "10") @Min(value = 1, message = PAGE) @Max(value = 100, message = PAGE) int limit
    ) {
        return movies.similar(id, minScore, limit);
    }
}
