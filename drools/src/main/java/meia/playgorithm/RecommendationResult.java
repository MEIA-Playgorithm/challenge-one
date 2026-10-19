package meia.playgorithm;

import meia.playgorithm.facts.ExclusionReason;
import meia.playgorithm.facts.Movie;
import meia.playgorithm.facts.PreferenceReason;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/** The recommendations of one user and the inferred facts that explain them. */
public record RecommendationResult(KnowledgeBaseResult knowledgeBase, UserProfile user, List<Recommendation> recommendations) {

    public RecommendationResult {
        recommendations = List.copyOf(recommendations);
    }

    public List<Movie> movies() {
        return knowledgeBase.movies();
    }

    public Optional<Movie> findMovie(String query) {
        String normalized = normalize(query);
        return movies().stream()
            .filter(movie -> normalize(movie.id()).equals(normalized) || normalize(movie.title()).equals(normalized))
            .findFirst();
    }

    public Optional<Recommendation> findRecommendation(String query) {
        String normalized = normalize(query);
        return recommendations.stream()
            .filter(recommendation -> normalize(recommendation.getMovieId()).equals(normalized)
                || normalize(recommendation.getMovieTitle()).equals(normalized))
            .findFirst();
    }

    /** Exclusion reasons of a movie for this user, with the rule that inferred each one. */
    public List<ExclusionReason> exclusions(Movie movie) {
        return knowledgeBase.exclusions(user.id(), movie.id());
    }

    /** Preference reasons of a movie for this user, with the rule that inferred each one. */
    public List<PreferenceReason> preferences(Movie movie) {
        return knowledgeBase.preferences(user.id(), movie.id());
    }

    /** The rules that fired for a movie and this user, as trace events. */
    public List<TraceEvent> traceFor(Movie movie) {
        List<TraceEvent> events = new ArrayList<>();
        exclusions(movie).forEach(reason ->
            events.add(new TraceEvent("EXCLUSION", reason.rule(), movie.id(), movie.title(), reason.label())));
        preferences(movie).forEach(reason ->
            events.add(new TraceEvent("PREFERENCE", reason.rule(), movie.id(), movie.title(), reason.label())));
        return events;
    }

    public List<TraceEvent> traceFor(String query) {
        return findMovie(query).map(this::traceFor).orElseGet(List::of);
    }

    public List<TraceEvent> traceEvents() {
        List<TraceEvent> events = new ArrayList<>();
        movies().forEach(movie -> events.addAll(traceFor(movie)));
        return events;
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }
}
