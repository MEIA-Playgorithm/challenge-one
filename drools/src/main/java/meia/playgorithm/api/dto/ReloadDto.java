package meia.playgorithm.api.dto;

/** `reloaded` é all, users ou movies. */
@SnakeCase
public record ReloadDto(String status, String reloaded, int movies, int users) {
}
