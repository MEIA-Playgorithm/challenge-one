package meia.playgorithm.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/** Uma razão de recomendação, por exemplo genre(preferred) -> type genre, value preferred. */
@SnakeCase
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ReasonDto(String type, String value) {

    public static ReasonDto of(String reason) {
        int start = reason.indexOf('(');
        int end = reason.endsWith(")") ? reason.length() - 1 : -1;
        if (start > 0 && end > start) {
            return new ReasonDto(reason.substring(0, start), reason.substring(start + 1, end));
        }
        return new ReasonDto(reason, null);
    }
}
