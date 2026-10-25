package meia.playgorithm.model;

/**
 * An explicit user limit such as max_duration_minutes, or one
 * value of a list limit such as required_languages. The value is kept as text,
 * as read from the CSV.
 */
public record UserLimit(String userId, Limit limit, String value) {

    public double number() {
        return Double.parseDouble(value);
    }

    /** The numeric value as text: 8, 7.5. */
    public String numberText() {
        return value.contains(".") ? Double.toString(number()) : Long.toString(Math.round(number()));
    }
}
