package meia.playgorithm.api.dto;

import java.util.List;

/** Uma preferência que o filme não cumpre. */
@SnakeCase
public record UnmetDto(String type, List<String> arguments) {

    public static UnmetDto of(String preference) {
        return new UnmetDto(preference.replace(' ', '_'), List.of());
    }
}
