package meia.playgorithm.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import meia.playgorithm.model.TraceEvent;

/** Porque um filme não foi recomendado. `exclusions` só existe quando o filme não foi recomendado. */
@SnakeCase
@JsonInclude(JsonInclude.Include.NON_NULL)
public record WhyNotDto(
    String explanationType,
    MovieDto movie,
    String conclusion,
    List<TraceEvent> exclusions,
    List<TraceEvent> trace
) {
}
