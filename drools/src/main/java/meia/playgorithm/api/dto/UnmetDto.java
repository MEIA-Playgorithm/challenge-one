package meia.playgorithm.api.dto;

import java.util.Arrays;
import java.util.List;

/** Uma preferência que o filme não cumpre, por exemplo genre(Adventure) -> type genre, arguments [Adventure]. */
@SnakeCase
public record UnmetDto(String type, List<String> arguments) {

    public static UnmetDto of(String preference) {
        int start = preference.indexOf('(');
        if (start > 0 && preference.endsWith(")")) {
            String arguments = preference.substring(start + 1, preference.length() - 1);
            return new UnmetDto(preference.substring(0, start), Arrays.asList(arguments.split(",")));
        }
        return new UnmetDto(preference, List.of());
    }
}
