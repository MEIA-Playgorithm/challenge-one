package meia.playgorithm.model;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

/** Na API os campos saem em snake_case (movie_id), como no resto do contrato. */
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record TraceEvent(
    String type,
    String rule,
    String movieId,
    String movieTitle,
    String details
) {
}
