package meia.playgorithm.api.dto;

import java.util.List;

/** A pergunta por responder e o porquê: a regra que precisa da resposta e as suas condições. */
@SnakeCase
public record DialogueQuestionDto(String key, String text, List<String> options, String rule, List<String> why) {
}
