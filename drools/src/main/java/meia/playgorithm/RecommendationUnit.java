package meia.playgorithm;

import meia.playgorithm.facts.ContentAttribute;
import meia.playgorithm.facts.Dislikes;
import meia.playgorithm.facts.ExcludedMovie;
import meia.playgorithm.facts.ExclusionReason;
import meia.playgorithm.facts.GenreHint;
import meia.playgorithm.facts.Likes;
import meia.playgorithm.facts.MatchesPreferences;
import meia.playgorithm.facts.Movie;
import meia.playgorithm.facts.MovieClass;
import meia.playgorithm.facts.MovieFeature;
import meia.playgorithm.facts.MovieGenres;
import meia.playgorithm.facts.MovieRelation;
import meia.playgorithm.facts.PreferenceReason;
import meia.playgorithm.facts.PreferenceWeight;
import meia.playgorithm.facts.Prefers;
import meia.playgorithm.facts.SimilarityScore;
import meia.playgorithm.facts.User;
import meia.playgorithm.facts.UserLimit;
import meia.playgorithm.facts.Watched;
import meia.playgorithm.facts.Wishlist;
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
