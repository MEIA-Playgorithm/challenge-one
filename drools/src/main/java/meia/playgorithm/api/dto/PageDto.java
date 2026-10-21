package meia.playgorithm.api.dto;

import java.util.List;

/** Uma página de uma lista: `total` conta os resultados antes de aplicar o limite. */
@SnakeCase
public record PageDto<T>(int total, int offset, int limit, List<T> items) {
}
