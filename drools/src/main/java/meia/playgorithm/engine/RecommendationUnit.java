package meia.playgorithm.engine;

import meia.playgorithm.model.ContentAttribute;
import meia.playgorithm.model.Dislikes;
import meia.playgorithm.model.ExcludedMovie;
import meia.playgorithm.model.ExclusionReason;
import meia.playgorithm.model.GenreHint;
import meia.playgorithm.model.Likes;
import meia.playgorithm.model.MatchesPreferences;
import meia.playgorithm.model.Movie;
import meia.playgorithm.model.MovieClass;
import meia.playgorithm.model.MovieFeature;
import meia.playgorithm.model.MovieGenres;
import meia.playgorithm.model.MovieRelation;
import meia.playgorithm.model.PreferenceReason;
import meia.playgorithm.model.PreferenceWeight;
import meia.playgorithm.model.Prefers;
import meia.playgorithm.model.SimilarityScore;
import meia.playgorithm.model.User;
import meia.playgorithm.model.UserLimit;
import meia.playgorithm.model.Watched;
import meia.playgorithm.model.Wishlist;
import org.drools.ruleunits.api.DataSource;
import org.drools.ruleunits.api.DataStore;
import org.drools.ruleunits.api.RuleUnitData;

/**
 * Working memory of the recommendation knowledge base (movies.drl and
 * users.drl). It holds every movie and every user at once, in three
 * blocks: reference knowledge
 * (genre hints and preference weights), input data from the CSV files, and
 * the facts the rules infer.
 */
public class RecommendationUnit implements RuleUnitData {

    private final DataStore<GenreHint> genreHints = DataSource.createStore();
    private final DataStore<ContentAttribute> contentAttributes = DataSource.createStore();
    private final DataStore<PreferenceWeight> preferenceWeights = DataSource.createStore();

    private final DataStore<Movie> movies = DataSource.createStore();
    private final DataStore<User> users = DataSource.createStore();
    private final DataStore<Likes> likes = DataSource.createStore();
    private final DataStore<Dislikes> dislikes = DataSource.createStore();
    private final DataStore<Prefers> prefers = DataSource.createStore();
    private final DataStore<Wishlist> wishlist = DataSource.createStore();
    private final DataStore<Watched> watched = DataSource.createStore();
    private final DataStore<UserLimit> userLimits = DataSource.createStore();

    private final DataStore<MovieFeature> movieFeatures = DataSource.createStore();
    private final DataStore<MovieClass> movieClasses = DataSource.createStore();
    private final DataStore<MovieGenres> movieGenres = DataSource.createStore();
    private final DataStore<MovieRelation> movieRelations = DataSource.createStore();
    private final DataStore<SimilarityScore> similarityScores = DataSource.createStore();
    private final DataStore<ExclusionReason> exclusionReasons = DataSource.createStore();
    private final DataStore<PreferenceReason> preferenceReasons = DataSource.createStore();
    private final DataStore<MatchesPreferences> matchesPreferences = DataSource.createStore();
    private final DataStore<ExcludedMovie> excludedMovies = DataSource.createStore();

    public DataStore<GenreHint> getGenreHints() {
        return genreHints;
    }

    public DataStore<ContentAttribute> getContentAttributes() {
        return contentAttributes;
    }

    public DataStore<PreferenceWeight> getPreferenceWeights() {
        return preferenceWeights;
    }

    public DataStore<Movie> getMovies() {
        return movies;
    }

    public DataStore<User> getUsers() {
        return users;
    }

    public DataStore<Likes> getLikes() {
        return likes;
    }

    public DataStore<Dislikes> getDislikes() {
        return dislikes;
    }

    public DataStore<Prefers> getPrefers() {
        return prefers;
    }

    public DataStore<Wishlist> getWishlist() {
        return wishlist;
    }

    public DataStore<Watched> getWatched() {
        return watched;
    }

    public DataStore<UserLimit> getUserLimits() {
        return userLimits;
    }

    public DataStore<MovieFeature> getMovieFeatures() {
        return movieFeatures;
    }

    public DataStore<MovieClass> getMovieClasses() {
        return movieClasses;
    }

    public DataStore<MovieGenres> getMovieGenres() {
        return movieGenres;
    }

    public DataStore<MovieRelation> getMovieRelations() {
        return movieRelations;
    }

    public DataStore<SimilarityScore> getSimilarityScores() {
        return similarityScores;
    }

    public DataStore<ExclusionReason> getExclusionReasons() {
        return exclusionReasons;
    }

    public DataStore<PreferenceReason> getPreferenceReasons() {
        return preferenceReasons;
    }

    public DataStore<MatchesPreferences> getMatchesPreferences() {
        return matchesPreferences;
    }

    public DataStore<ExcludedMovie> getExcludedMovies() {
        return excludedMovies;
    }
}
