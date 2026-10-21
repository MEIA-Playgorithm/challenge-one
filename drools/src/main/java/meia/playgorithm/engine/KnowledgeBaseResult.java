package meia.playgorithm.engine;

import meia.playgorithm.model.Attribute;
import meia.playgorithm.model.ExcludedMovie;
import meia.playgorithm.model.ExclusionReason;
import meia.playgorithm.model.MatchesPreferences;
import meia.playgorithm.model.Movie;
import meia.playgorithm.model.MovieClass;
import meia.playgorithm.model.MovieFeature;
import meia.playgorithm.model.MovieGenres;
import meia.playgorithm.model.MovieRelation;
import meia.playgorithm.model.PreferenceReason;
import meia.playgorithm.model.SimilarityScore;
import meia.playgorithm.model.UserProfile;

import java.util.List;
import java.util.Optional;

/** Every fact in working memory after the recommendation rules ran. */
public record KnowledgeBaseResult(
    List<Movie> movies,
    List<UserProfile> users,
    List<MovieFeature> movieFeatures,
    List<MovieClass> movieClasses,
    List<MovieGenres> movieGenres,
    List<MovieRelation> movieRelations,
    List<SimilarityScore> similarityScores,
    List<ExclusionReason> exclusionReasons,
    List<PreferenceReason> preferenceReasons,
    List<MatchesPreferences> matchesPreferences,
    List<ExcludedMovie> excludedMovies
) {

    public KnowledgeBaseResult {
        movies = List.copyOf(movies);
        users = List.copyOf(users);
        movieFeatures = List.copyOf(movieFeatures);
        movieClasses = List.copyOf(movieClasses);
        movieGenres = List.copyOf(movieGenres);
        movieRelations = List.copyOf(movieRelations);
        similarityScores = List.copyOf(similarityScores);
        exclusionReasons = List.copyOf(exclusionReasons);
        preferenceReasons = List.copyOf(preferenceReasons);
        matchesPreferences = List.copyOf(matchesPreferences);
        excludedMovies = List.copyOf(excludedMovies);
    }

    public Optional<UserProfile> user(String userId) {
        return users.stream().filter(user -> user.id().equals(userId)).findFirst();
    }

    public List<String> userIds() {
        return users.stream().map(UserProfile::id).toList();
    }

    public Optional<Movie> movie(String movieId) {
        return movies.stream().filter(movie -> movie.id().equals(movieId)).findFirst();
    }

    /** Values of one inferred feature of a movie, e.g. its pace or its emotional tones. */
    public List<String> features(String movieId, Attribute feature) {
        return movieFeatures.stream()
            .filter(fact -> fact.movieId().equals(movieId) && fact.feature() == feature)
            .map(MovieFeature::value)
            .toList();
    }

    public Optional<String> feature(String movieId, Attribute feature) {
        return features(movieId, feature).stream().findFirst();
    }

    public List<SimilarityScore> similarTo(String movieId) {
        return similarityScores.stream().filter(score -> score.movieA().equals(movieId)).toList();
    }

    public List<ExclusionReason> exclusions(String userId, String movieId) {
        return exclusionReasons.stream()
            .filter(reason -> reason.userId().equals(userId) && reason.movieId().equals(movieId))
            .toList();
    }

    public List<PreferenceReason> preferences(String userId, String movieId) {
        return preferenceReasons.stream()
            .filter(reason -> reason.userId().equals(userId) && reason.movieId().equals(movieId))
            .toList();
    }

    public boolean excluded(String userId, String movieId) {
        return excludedMovies.stream()
            .anyMatch(fact -> fact.userId().equals(userId) && fact.movieId().equals(movieId));
    }

    /** Recommendations and explanations of one user. */
    public RecommendationResult forUser(String userId) {
        UserProfile user = user(userId)
            .orElseThrow(() -> new IllegalArgumentException("Unknown user: " + userId));
        return new RecommendationResult(this, user, RecommendationQueries.recommendations(this, user));
    }
}
