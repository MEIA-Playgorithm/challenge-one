package meia.playgorithm;

public class Recommendation {

    private String movieTitle;
    private String reason;

    public Recommendation(String movieTitle, String reason) {
        this.movieTitle = movieTitle;
        this.reason = reason;
    }

    public String getMovieTitle() {
        return movieTitle;
    }

    public String getReason() {
        return reason;
    }
}