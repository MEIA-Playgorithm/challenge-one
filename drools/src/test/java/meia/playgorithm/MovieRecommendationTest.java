package meia.playgorithm;

import org.drools.ruleunits.api.RuleUnitInstance;
import org.drools.ruleunits.api.RuleUnitProvider;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class MovieRecommendationTest {

    @Test
    void shouldRecommendScienceFictionMovies() {

        MovieRecommendationUnit unit = new MovieRecommendationUnit();

        unit.getPreferences().add(
            new UserPreferences("Sci-Fi")
        );

        unit.getMovies().add(
            new Movie("Interstellar", "Sci-Fi", 2014)
        );

        unit.getMovies().add(
            new Movie("The Dark Knight", "Action", 2008)
        );

        unit.getMovies().add(
            new Movie("Inception", "Sci-Fi", 2010)
        );

        RuleUnitInstance<MovieRecommendationUnit> instance =
            RuleUnitProvider.get()
                .createRuleUnitInstance(unit);

        instance.fire();

        List<Recommendation> recommendations = new ArrayList<>();

        var results = instance.executeQuery("FindRecommendations");

        for (var row : results) {
            recommendations.add(
                (Recommendation) row.get("$recommendation")
            );
        }

        assertEquals(2, recommendations.size());

        instance.close();
    }
}