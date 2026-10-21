package meia.playgorithm.api.dto;

import java.util.List;
import java.util.Map;

/**
 * O estado do diálogo depois das respostas recebidas. `status` é question (falta responder a
 * `question`) ou done (o diálogo terminou e `question` é null).
 */
@SnakeCase
public record DialogueDto(
    String userId,
    String status,
    DialogueQuestionDto question,
    Map<String, String> answers,
    List<DialogueConclusionDto> conclusions,
    List<String> workingMemory
) {
}
