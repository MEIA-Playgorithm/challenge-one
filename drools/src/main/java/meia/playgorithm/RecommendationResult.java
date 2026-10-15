package meia.playgorithm;

import java.util.List;
import java.util.Optional;

public record RecommendationResult(
    List<Movie> movies,
    List<Recommendation> recommendations,
    List<TraceEvent> traceEvents
) {

    public Optional<Movie> findMovie(String query) {
        String normalized = normalize(query);
        return movies.stream()
            .filter(movie -> normalize(movie.getId()).equals(normalized)
                || normalize(movie.getTitle()).equals(normalized))
            .findFirst();
    }

    public Optional<Recommendation> findRecommendation(String query) {
        String normalized = normalize(query);
        return recommendations.stream()
            .filter(recommendation -> normalize(recommendation.getMovieId()).equals(normalized)
                || normalize(recommendation.getMovieTitle()).equals(normalized))
            .findFirst();
    }

    public List<TraceEvent> traceFor(Movie movie) {
        return traceEvents.stream()
            .filter(event -> event.movieId().equals(movie.getId()))
            .toList();
    }

    public List<TraceEvent> traceFor(String query) {
        return findMovie(query)
            .map(this::traceFor)
            .orElseGet(List::of);
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }
}
