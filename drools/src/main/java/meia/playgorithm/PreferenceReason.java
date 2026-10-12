package meia.playgorithm;

public record PreferenceReason(String type, String value, int weight) {

    public boolean isSecondary() {
        return !type.equals("genre")
            && !type.equals("director")
            && !type.equals("star");
    }

    public String label() {
        return value == null || value.isBlank()
            ? type
            : type + "(" + value + ")";
    }
}
