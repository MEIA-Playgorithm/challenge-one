package meia.playgorithm.service;

import java.util.Comparator;
import java.util.List;
import meia.playgorithm.api.dto.MovieDto;
import meia.playgorithm.api.dto.PageDto;
import meia.playgorithm.api.dto.SimilarMovieDto;
import meia.playgorithm.api.dto.SimilarMoviesDto;
import meia.playgorithm.engine.KnowledgeBaseResult;
import meia.playgorithm.model.Attribute;
import meia.playgorithm.model.Movie;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** O catálogo de filmes: listagem com filtros, leitura de um filme e filmes parecidos. */
@Service
public class MovieService {

    private final KnowledgeBaseService knowledgeBase;

    public MovieService(KnowledgeBaseService knowledgeBase) {
        this.knowledgeBase = knowledgeBase;
    }

    /** Os filtros a null não filtram. O ritmo e a complexidade são os inferidos pelas regras. */
    public PageDto<MovieDto> list(String genre, String pace, String complexity, int limit, int offset) {
        KnowledgeBaseResult current = knowledgeBase.current();
        List<Movie> filtered = current.movies().stream()
            .filter(movie -> genre == null || movie.genres().contains(genre))
            .filter(movie -> pace == null || current.features(movie.id(), Attribute.PACE).contains(pace))
            .filter(movie -> complexity == null || current.features(movie.id(), Attribute.COMPLEXITY).contains(complexity))
            .toList();
        List<MovieDto> items = Pages.slice(filtered, offset, limit).stream()
            .map(movie -> MovieDto.of(movie, current))
            .toList();
        return new PageDto<>(filtered.size(), offset, limit, items);
    }

    public MovieDto get(String id) {
        KnowledgeBaseResult current = knowledgeBase.current();
        return MovieDto.of(require(current, id), current);
    }

    /** Filmes parecidos com `id` (regra "Similarity score"), do mais para o menos parecido. */
    public SimilarMoviesDto similar(String id, int minScore, int limit) {
        KnowledgeBaseResult current = knowledgeBase.current();
        require(current, id);
        List<SimilarMovieDto> similar = current.similarTo(id).stream()
            .filter(score -> score.score() >= minScore)
            .map(score -> new SimilarMovieDto(score.score(), MovieDto.of(require(current, score.movieB()), current)))
            .sorted(Comparator.comparingInt(SimilarMovieDto::score).reversed()
                .thenComparing(candidate -> candidate.movie().id()))
            .toList();
        return new SimilarMoviesDto(id, similar.size(), Pages.slice(similar, 0, limit));
    }

    private static Movie require(KnowledgeBaseResult current, String id) {
        return current.movie(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Filme não encontrado"));
    }
}
