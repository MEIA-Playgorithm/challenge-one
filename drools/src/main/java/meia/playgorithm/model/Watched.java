package meia.playgorithm.model;

/** A movie the user watched, with the user's rating ( 0 to 5; 0 when the CSV has no rating). */
public record Watched(String userId, String movieId, int rating) {
}
