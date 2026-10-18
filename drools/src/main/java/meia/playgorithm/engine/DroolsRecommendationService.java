package meia.playgorithm.engine;

import meia.playgorithm.model.Movie;
import meia.playgorithm.model.Recommendation;
import meia.playgorithm.model.RecommendationResult;
import meia.playgorithm.model.TraceEvent;
import meia.playgorithm.model.UserPreferences;

import org.drools.ruleunits.api.RuleUnitInstance;
import org.drools.ruleunits.api.RuleUnitProvider;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class DroolsRecommendationService {

    public RecommendationResult evaluate(UserPreferences preferences, List<Movie> movies) {
        MovieRecommendationUnit unit = new MovieRecommendationUnit();
        unit.getPreferences().add(preferences);
        movies.forEach(unit.getMovies()::add);

        RuleUnitInstance<MovieRecommendationUnit> instance = RuleUnitProvider.get()
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
        recommendations.sort(Comparator
            .comparingInt(DroolsRecommendationService::statusPriority)
            .thenComparing(Recommendation::getScore, Comparator.reverseOrder()));

        return new RecommendationResult(List.copyOf(movies), recommendations, traceEvents);
    }

    private static int statusPriority(Recommendation recommendation) {
        return recommendation.getStatus().equals("main") ? 0 : 1;
    }
}
