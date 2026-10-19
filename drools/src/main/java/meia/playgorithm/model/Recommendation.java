package meia.playgorithm.model;

import java.util.List;
import java.util.Map;

public class Recommendation {

    private final String movieId;
    private final String movieTitle;
    private final String reason;
    private final double score;
    private final String status;
    private final List<String> reasons;
    private final List<String> unmetPreferences;
    private final Map<String, Double> scoreBreakdown;

    public Recommendation(String movieTitle, String reason) {
        this(null, movieTitle, 0, "main", List.of(reason), List.of(), Map.of());
    }

    public Recommendation(
        String movieId,
        String movieTitle,
        double score,
        String status,
        List<String> reasons,
        List<String> unmetPreferences,
        Map<String, Double> scoreBreakdown
    ) {
        this.movieId = movieId;
        this.movieTitle = movieTitle;
        this.score = score;
        this.status = status;
        this.reasons = List.copyOf(reasons);
        this.unmetPreferences = List.copyOf(unmetPreferences);
        this.scoreBreakdown = Map.copyOf(scoreBreakdown);
        this.reason = String.join("; ", this.reasons);
    }

    public String getMovieId() {
        return movieId;
    }

    public String getMovieTitle() {
        return movieTitle;
    }

    public String getReason() {
        return reason;
    }

    public double getScore() {
        return score;
    }

    public String getStatus() {
        return status;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public List<String> getUnmetPreferences() {
        return unmetPreferences;
    }

    public Map<String, Double> getScoreBreakdown() {
        return scoreBreakdown;
    }
}
