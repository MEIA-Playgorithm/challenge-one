package meia.playgorithm;

import meia.playgorithm.facts.Limit;
import meia.playgorithm.facts.Movie;
import meia.playgorithm.facts.PreferenceReason;
import meia.playgorithm.facts.Reason;
import meia.playgorithm.facts.UserLimit;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.TreeSet;

/**
 * Reads recommendations from the inferred facts: which movies are recommended,
 * their score, status and ranking, and the preferences they leave unmet. These
 * are not rules; they only aggregate the preference reasons once every
 * exclusion has been inferred.
 */
final class RecommendationQueries {

    private static final int MAX_SECONDARY = 9;

    private RecommendationQueries() {
    }

    static List<Recommendation> recommendations(KnowledgeBaseResult result, UserProfile user) {
        Optional<UserLimit> minimumRating = limit(user, Limit.MIN_RATING);
        List<Ranked> ranked = new ArrayList<>();

        for (Movie movie : result.movies()) {
            if (result.excluded(user.id(), movie.id())) {
                continue;
            }
            List<PreferenceReason> pairs = sortedDistinct(result.preferences(user.id(), movie.id()));
            Map<String, Double> breakdown = scoreBreakdown(movie, pairs);
            double score = round(breakdown.values().stream().mapToDouble(Double::doubleValue).sum());
            boolean belowTarget = minimumRating.isPresent()
                && movie.rating() != null && movie.rating() < minimumRating.get().number();

            List<String> reasons = new ArrayList<>();
            if (movie.rating() != null) {
                reasons.add("rating(" + movie.ratingText() + ")");
            }
            pairs.forEach(reason -> reasons.add(reason.label()));

            Recommendation recommendation = new Recommendation(
                movie.id(),
                movie.title(),
                score,
                belowTarget ? "alternative" : "main",
                reasons,
                unmetPreferences(user, movie, pairs, minimumRating),
                breakdown
            );
            ranked.add(new Ranked(recommendation, movie.rating()));
        }

        ranked.sort(RANKING);
        return ranked.stream().map(Ranked::recommendation).toList();
    }

    private record Ranked(Recommendation recommendation, Double rating) {
    }

    // Ranking: main before alternative, then score, then rating, then id.
    private static final Comparator<Ranked> RANKING = Comparator
        .comparingInt((Ranked ranked) -> ranked.recommendation().getStatus().equals("main") ? 0 : 1)
        .thenComparing(ranked -> -ranked.recommendation().getScore())
        .thenComparing(ranked -> ranked.rating() == null ? 1.0 : -ranked.rating())
        .thenComparing(ranked -> ranked.recommendation().getMovieId());

    // Score components: genre 40; IMDb rating 0..30; director/star 0..20; the rest 0..9.
    private static Map<String, Double> scoreBreakdown(Movie movie, List<PreferenceReason> pairs) {
        boolean history = has(pairs, Reason.LIKED_SIMILARITY);
        int secondary = pairs.stream()
            .filter(reason -> reason.reason().isSecondary() && reason.reason() != Reason.LIKED_SIMILARITY)
            .mapToInt(PreferenceReason::weight)
            .sum();

        Map<String, Double> breakdown = new LinkedHashMap<>();
        breakdown.put("genre", has(pairs, Reason.GENRE) ? 40.0 : 0.0);
        breakdown.put("rating", movie.rating() == null ? 0.0 : Math.round(300 * movie.rating()) / 100.0);
        breakdown.put("director", has(pairs, Reason.DIRECTOR) ? 10.0 : 0.0);
        breakdown.put("star", has(pairs, Reason.STAR) ? 10.0 : 0.0);
        breakdown.put("secondary", (double) Math.min(MAX_SECONDARY, secondary + (history ? 1 : 0)));
        return breakdown;
    }

    // Unmet preferences: requested preferences the movie does not satisfy.
    private static List<String> unmetPreferences(
        UserProfile user, Movie movie, List<PreferenceReason> pairs, Optional<UserLimit> minimumRating
    ) {
        List<String> satisfied = pairs.stream().map(PreferenceReason::label).toList();
        TreeSet<String> unmet = new TreeSet<>();
        user.likes().forEach(like -> unmet.add(like.attribute().key() + "(" + like.value() + ")"));
        user.prefers().forEach(prefers -> unmet.add(prefers.attribute().key() + "(" + prefers.value() + ")"));
        satisfied.forEach(unmet::remove);
        if (minimumRating.isPresent() && movie.rating() != null && movie.rating() < minimumRating.get().number()) {
            unmet.add("rating_below_target(" + movie.ratingText() + "," + minimumRating.get().numberText() + ")");
        }
        return new ArrayList<>(unmet);
    }

    /** Distinct reasons, sorted: reasons without a value (wishlist) first, then by name and value. */
    private static List<PreferenceReason> sortedDistinct(List<PreferenceReason> reasons) {
        Map<String, PreferenceReason> distinct = new TreeMap<>();
        for (PreferenceReason reason : reasons) {
            String key = (reason.value().isEmpty() ? "0" : "1") + reason.reason().key() + "\u0000" + reason.value() + "\u0000" + reason.weight();
            distinct.putIfAbsent(key, reason);
        }
        return List.copyOf(distinct.values());
    }

    private static boolean has(List<PreferenceReason> pairs, Reason reason) {
        return pairs.stream().anyMatch(pair -> pair.reason() == reason);
    }

    private static Optional<UserLimit> limit(UserProfile user, Limit limit) {
        return user.limits().stream().filter(candidate -> candidate.limit() == limit).findFirst();
    }

    private static double round(double value) {
        return Math.round(value * 100) / 100.0;
    }
}
