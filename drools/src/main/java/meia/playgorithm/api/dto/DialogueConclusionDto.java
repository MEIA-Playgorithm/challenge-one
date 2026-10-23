package meia.playgorithm.api.dto;

import java.util.List;

/** Uma conclusão do diálogo (ex.: sugerir_genero Comedy), a regra que a inseriu e como se chegou a ela. */
@SnakeCase
public record DialogueConclusionDto(String type, String value, String rule, List<String> how) {
}
