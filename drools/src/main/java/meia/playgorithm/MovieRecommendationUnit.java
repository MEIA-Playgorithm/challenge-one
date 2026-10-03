package meia.playgorithm;

import org.drools.ruleunits.api.DataStore;
import org.drools.ruleunits.api.DataSource;
import org.drools.ruleunits.api.RuleUnitData;

public class MovieRecommendationUnit implements RuleUnitData {

    private final DataStore<Movie> movies;
    private final DataStore<UserPreferences> preferences;
    private final DataStore<Recommendation> recommendations;

    public MovieRecommendationUnit() {
        this.movies = DataSource.createStore();
        this.preferences = DataSource.createStore();
        this.recommendations = DataSource.createStore();
    }

    public DataStore<Movie> getMovies() {
        return movies;
    }

    public DataStore<UserPreferences> getPreferences() {
        return preferences;
    }

    public DataStore<Recommendation> getRecommendations() {
        return recommendations;
    }
}