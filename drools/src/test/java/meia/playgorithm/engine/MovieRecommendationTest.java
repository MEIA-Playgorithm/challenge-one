package meia.playgorithm.engine;

import meia.playgorithm.catalog.MovieCatalog;
import meia.playgorithm.catalog.UserCatalog;
import meia.playgorithm.model.Movie;
import meia.playgorithm.model.Recommendation;
import meia.playgorithm.model.TraceEvent;
import meia.playgorithm.model.UserPreferences;

import org.drools.ruleunits.api.RuleUnitInstance;
import org.drools.ruleunits.api.RuleUnitProvider;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class MovieRecommendationTest {

    @Test
    void shouldRecommendMoviesUsingPrologLikeScoringReasons() {
        UserPreferences preferences = UserPreferences.forUser("ana")
            .withAge(25)
            .withMaximumDurationMinutes(150)
            .withYearFrom(2000)
            .withYearTo(2026)
            .withMinimumRating(8.0, 0.0, true)
            .addLikedGenre("Action")
            .addMandatoryGenre("Action")
            .addLikedLanguage("English")
            .addPreferredDirector("Christopher Nolan")
            .addPreferredStar("Christian Bale")
            .addRequiredLanguage("English");

        Movie batman = Movie.identified("tt0372784", "Batman Begins", 2017)
            .addGenre("Action")
            .addLanguage("English")
            .addDirector("Christopher Nolan")
            .addStar("Christian Bale")
            .withDurationMinutes(140)
            .withRatingMpa("PG-13")
            .withRatingImdb(8.2);

        Movie comedy = Movie.identified("tt0000001", "Wrong Movie", 2017)
            .addGenre("Comedy")
            .addLanguage("English")
            .withDurationMinutes(100)
            .withRatingMpa("PG")
            .withRatingImdb(8.1);

        List<Recommendation> recommendations = run(preferences, batman, comedy);

        assertEquals(1, recommendations.size());
        Recommendation recommendation = recommendations.get(0);

        assertEquals("Batman Begins", recommendation.getMovieTitle());
        assertEquals("main", recommendation.getStatus());
        assertTrue(recommendation.getReasons().contains("genre(preferred)"));
        assertTrue(recommendation.getReasons().contains("director(preferred)"));
        assertTrue(recommendation.getReasons().contains("star(preferred)"));
        assertTrue(recommendation.getScore() > 80);
    }

    @Test
    void shouldExcludeMandatoryRatingWithoutTolerance() {
        UserPreferences preferences = UserPreferences.forUser("ana")
            .withAge(25)
            .withMinimumRating(8.0, 0.5, true)
            .addLikedGenre("Action");

        Movie almostGood = Movie.identified("m1", "Almost Good", 2020)
            .addGenre("Action")
            .withRatingMpa("PG-13")
            .withRatingImdb(7.9);

        assertEquals(0, run(preferences, almostGood).size());
    }

    @Test
    void shouldAllowAlternativeWhenRatingIsDesirableAndInsideTolerance() {
        UserPreferences preferences = UserPreferences.forUser("carla")
            .withAge(29)
            .withMinimumRating(8.0, 0.5, false)
            .addLikedGenre("Drama");

        Movie alternative = Movie.identified("m1", "Close Enough", 2020)
            .addGenre("Drama")
            .withRatingMpa("PG-13")
            .withRatingImdb(7.6);

        List<Recommendation> recommendations = run(preferences, alternative);

        assertEquals(1, recommendations.size());
        assertEquals("alternative", recommendations.get(0).getStatus());
        assertTrue(recommendations.get(0).getUnmetPreferences().contains("rating below target"));
    }

    @Test
    void shouldExcludeMoviesThatDoNotMatchAudienceAge() {
        UserPreferences preferences = UserPreferences.forUser("diogo")
            .withAge(12)
            .addLikedGenre("Horror");

        Movie horror = Movie.identified("m1", "Too Much", 2020)
            .addGenre("Horror")
            .withRatingMpa("R")
            .withRatingImdb(8.5);

        assertEquals(0, run(preferences, horror).size());
    }

    @Test
    void shouldExposeTraceEventsForRecommendationsAndExclusions() {
        UserPreferences preferences = UserPreferences.forUser("ana")
            .withAge(25)
            .addLikedGenre("Action")
            .addDislikedGenre("Comedy");

        Movie action = Movie.identified("m1", "Good Match", 2020)
            .addGenre("Action")
            .withRatingMpa("PG-13")
            .withRatingImdb(8.0);

        Movie comedy = Movie.identified("m2", "Bad Match", 2020)
            .addGenre("Comedy")
            .withRatingMpa("PG-13")
            .withRatingImdb(8.0);

        EngineResult result = runEngine(preferences, action, comedy);

        assertEquals(1, result.recommendations().size());
        assertTrue(result.traceEvents().stream().anyMatch(event ->
            event.type().equals("PREFERENCE")
                && event.rule().equals("Preference reason: genre")
                && event.movieTitle().equals("Good Match")));
        assertTrue(result.traceEvents().stream().anyMatch(event ->
            event.type().equals("RECOMMENDATION")
                && event.rule().equals("Create recommendation")
                && event.movieTitle().equals("Good Match")));
        assertTrue(result.traceEvents().stream().anyMatch(event ->
            event.type().equals("EXCLUSION")
                && event.rule().equals("Exclude explicitly disliked genres")
                && event.movieTitle().equals("Bad Match")));
    }

    @Test
    void shouldKeepBackwardCompatibleFavoriteGenreConstructor() {
        UserPreferences preferences = new UserPreferences("Sci-Fi");

        Movie interstellar = new Movie("Interstellar", "Sci-Fi", 2014)
            .withRatingMpa("PG-13")
            .withRatingImdb(8.7);

        Movie darkKnight = new Movie("The Dark Knight", "Action", 2008)
            .withRatingMpa("PG-13")
            .withRatingImdb(9.0);

        Movie inception = new Movie("Inception", "Sci-Fi", 2010)
            .withRatingMpa("PG-13")
            .withRatingImdb(8.8);

        assertEquals(2, run(preferences, interstellar, darkKnight, inception).size());
    }

    @Test
    void shouldLoadTheSameMovieCatalogUsedByProlog() {
        List<Movie> movies = MovieCatalog.movies();

        assertEquals(100, movies.size());
        Movie batman = movies.stream()
            .filter(movie -> movie.getId().equals("tt0372784"))
            .findFirst()
            .orElseThrow();

        assertEquals("Batman Begins", batman.getTitle());
        assertEquals("fast", batman.getPace());
        assertEquals("medium", batman.getComplexity());
        assertEquals("medium", batman.getViolence());
        assertEquals("low", batman.getHumor());
        assertEquals("high", batman.getPsychologicalIntensity());
        assertEquals("mainstream", batman.getAudience());
        assertEquals("modern", batman.getEra());
        assertEquals("very_popular", batman.getPopularity());
        assertTrue(batman.getSubgenres().contains("Action Epic"));
        assertTrue(batman.getSubgenres().contains("Superhero"));
        assertTrue(batman.getEmotionalTones().contains("sad"));
        assertTrue(batman.getEmotionalTones().contains("exciting"));
        assertTrue(batman.getThemes().contains("justice"));
    }

    @Test
    void shouldLoadUserProfilesUsedByThePrologApiContract() {
        UserPreferences ana = UserCatalog.find("ana").orElseThrow();

        assertEquals(25, ana.getAge());
        assertTrue(ana.getWishlistMovieIds().contains("tt0372784"));
        assertTrue(ana.getLikedGenres().contains("Action"));
        assertTrue(ana.getRequiredLanguages().contains("English"));
        assertTrue(ana.getPreferredDirectors().contains("Christopher Nolan"));
        assertTrue(ana.getPreferredThemes().contains("justice"));
        assertTrue(ana.isRatingRequired());
    }

    private List<Recommendation> run(UserPreferences preferences, Movie... movies) {
        return runEngine(preferences, movies).recommendations();
    }

    private EngineResult runEngine(UserPreferences preferences, Movie... movies) {
        MovieRecommendationUnit unit = new MovieRecommendationUnit();
        unit.getPreferences().add(preferences);

        for (Movie movie : movies) {
            unit.getMovies().add(movie);
        }

        RuleUnitInstance<MovieRecommendationUnit> instance =
            RuleUnitProvider.get()
                .createRuleUnitInstance(unit);

        instance.fire();

        List<Recommendation> recommendations = new ArrayList<>();
        var recommendationResults = instance.executeQuery("FindRecommendations");

        for (var row : recommendationResults) {
            recommendations.add((Recommendation) row.get("$recommendation"));
        }

        List<TraceEvent> traceEvents = new ArrayList<>();
        var traceResults = instance.executeQuery("FindTraceEvents");

        for (var row : traceResults) {
            traceEvents.add((TraceEvent) row.get("$traceEvent"));
        }

        instance.close();

        recommendations.sort(Comparator.comparing(Recommendation::getScore).reversed());
        return new EngineResult(recommendations, traceEvents);
    }

    private record EngineResult(List<Recommendation> recommendations, List<TraceEvent> traceEvents) {
    }
}
