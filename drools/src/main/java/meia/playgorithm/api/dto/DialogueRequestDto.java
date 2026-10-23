package meia.playgorithm.api.dto;

import java.util.Map;

/** O utilizador e as respostas que já deu, por pergunta (ex.: {"experiencia": "comedia"}). */
@SnakeCase
public record DialogueRequestDto(String userId, Map<String, String> answers) {
}
