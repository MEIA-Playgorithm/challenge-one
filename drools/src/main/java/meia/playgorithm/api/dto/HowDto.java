package meia.playgorithm.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import java.util.Map;
import meia.playgorithm.model.TraceEvent;

/**
 * Como se chegou a uma recomendação. Se o filme não foi recomendado, só vêm `movie` (o texto
 * pesquisado), `conclusion` e `trace`.
 */
@SnakeCase
@JsonInclude(JsonInclude.Include.NON_NULL)
public record HowDto(
    String explanationType,
    Object movie,
    String conclusion,
    List<ReasonDto> reasons,
    List<UnmetDto> unmetPreferences,
    Map<String, Double> scoreBreakdown,
    List<TraceEvent> trace
) {
}
