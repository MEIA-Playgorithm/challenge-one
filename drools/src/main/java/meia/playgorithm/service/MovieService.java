package meia.playgorithm.service;

import java.util.Comparator;
import java.util.List;
import meia.playgorithm.api.dto.MovieDto;
import meia.playgorithm.api.dto.PageDto;
import meia.playgorithm.api.dto.SimilarMovieDto;
import meia.playgorithm.api.dto.SimilarMoviesDto;
import meia.playgorithm.catalog.MovieCatalog;
import meia.playgorithm.model.Movie;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** O catálogo de filmes: listagem com filtros, leitura de um filme e filmes parecidos. */
@Service
public class MovieService {

    private final MovieCatalog catalog;

    public MovieService(MovieCatalog catalog) {
        this.catalog = catalog;
    }

    /** Os filtros a null não filtram. */
    public PageDto<MovieDto> list(String genre, String pace, String complexity, int limit, int offset) {
        List<Movie> filtered = catalog.movies().stream()
            .filter(movie -> genre == null || movie.getGenres().contains(genre))
            .filter(movie -> pace == null || pace.equals(movie.getPace()))
            .filter(movie -> complexity == null || complexity.equals(movie.getComplexity()))
            .toList();
        List<MovieDto> items = Pages.slice(filtered, offset, limit).stream().map(MovieDto::of).toList();
        return new PageDto<>(filtered.size(), offset, limit, items);
    }

    public MovieDto get(String id) {
        return MovieDto.of(require(id));
    }

    /** Filmes parecidos com `id`, do mais para o menos parecido; o próprio filme nunca aparece. */
    public SimilarMoviesDto similar(String id, int minScore, int limit) {
        Movie source = require(id);
        List<SimilarMovieDto> similar = catalog.movies().stream()
            .filter(movie -> !movie.getId().equals(source.getId()))
            .map(movie -> new SimilarMovieDto(similarityScore(source, movie), MovieDto.of(movie)))
            .filter(candidate -> candidate.score() >= minScore)
            .sorted(Comparator.comparingInt(SimilarMovieDto::score).reversed()
                .thenComparing(candidate -> candidate.movie().id()))
            .toList();
        return new SimilarMoviesDto(id, similar.size(), Pages.slice(similar, 0, limit));
    }

    private Movie require(String id) {
        return catalog.movies().stream()
            .filter(movie -> movie.getId().equals(id))
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Filme não encontrado"));
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
}
