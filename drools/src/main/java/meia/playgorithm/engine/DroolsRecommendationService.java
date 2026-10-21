package meia.playgorithm.engine;

import meia.playgorithm.model.Movie;
import meia.playgorithm.model.UserProfile;
import org.drools.ruleunits.api.RuleUnitInstance;
import org.drools.ruleunits.api.RuleUnitProvider;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Runs the recommendation knowledge base: inserts the reference knowledge, the movie and user facts,
 * fires every rule of movies.drl and users.drl until nothing new is inferred
 * and returns the inferred facts.
 */
@Service
public class DroolsRecommendationService {

    public KnowledgeBaseResult run(List<Movie> movies, List<UserProfile> users) {
        RecommendationUnit unit = new RecommendationUnit();
        KnowledgeTables tables = KnowledgeTables.load();
        tables.genreHints().forEach(unit.getGenreHints()::add);
        tables.contentAttributes().forEach(unit.getContentAttributes()::add);
        tables.preferenceWeights().forEach(unit.getPreferenceWeights()::add);
        movies.forEach(unit.getMovies()::add);
        for (UserProfile user : users) {
            unit.getUsers().add(user.user());
            user.likes().forEach(unit.getLikes()::add);
            user.dislikes().forEach(unit.getDislikes()::add);
            user.prefers().forEach(unit.getPrefers()::add);
            user.wishlist().forEach(unit.getWishlist()::add);
            user.watched().forEach(unit.getWatched()::add);
            user.limits().forEach(unit.getUserLimits()::add);
        }

        RuleUnitInstance<RecommendationUnit> instance = RuleUnitProvider.get().createRuleUnitInstance(unit);
        try {
            instance.fire();
            return new KnowledgeBaseResult(
                movies,
                users,
                query(instance, "FindMovieFeatures"),
                query(instance, "FindMovieClasses"),
                query(instance, "FindMovieGenres"),
                query(instance, "FindMovieRelations"),
                query(instance, "FindSimilarityScores"),
                query(instance, "FindExclusionReasons"),
                query(instance, "FindPreferenceReasons"),
                query(instance, "FindMatchesPreferences"),
                query(instance, "FindExcludedMovies")
            );
        } finally {
            instance.close();
        }
    }

    @SuppressWarnings("unchecked")
    private static <T> List<T> query(RuleUnitInstance<RecommendationUnit> instance, String name) {
        List<T> facts = new ArrayList<>();
        for (var row : instance.executeQuery(name)) {
            facts.add((T) row.get("$fact"));
        }
        return facts;
    }
}
