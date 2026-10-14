package meia.playgorithm;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public final class SampleUserCatalog {

    private static final List<Path> CSV_CANDIDATES = List.of(
        Path.of("../swi-prolog/knowledge_base_users.csv"),
        Path.of("swi-prolog/knowledge_base_users.csv")
    );

    private SampleUserCatalog() {
    }

    public static Optional<UserPreferences> find(String userId) {
        return users().stream()
            .filter(user -> user.getUserId().equals(userId))
            .findFirst();
    }

    public static List<UserPreferences> users() {
        return usersFromCsv(findCatalogPath());
    }

    private static Path findCatalogPath() {
        return CSV_CANDIDATES.stream()
            .filter(Files::isRegularFile)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException(
                "Could not find swi-prolog/knowledge_base_users.csv from the current directory."
            ));
    }

    private static List<UserPreferences> usersFromCsv(Path path) {
        try {
            List<String> lines = Files.readAllLines(path);
            if (lines.size() < 2) {
                return List.of();
            }

            List<String> headers = parseCsvLine(lines.get(0));
            Map<String, Integer> indexes = indexes(headers);
            List<UserPreferences> users = new ArrayList<>();

            for (int i = 1; i < lines.size(); i++) {
                if (!lines.get(i).isBlank()) {
                    users.add(userFromRow(parseCsvLine(lines.get(i)), indexes));
                }
            }

            return users;
        } catch (IOException exception) {
            throw new IllegalStateException("Could not load user catalog from " + path, exception);
        }
    }

    private static UserPreferences userFromRow(List<String> row, Map<String, Integer> indexes) {
        UserPreferences preferences = UserPreferences.forUser(value(row, indexes, "user_id"))
            .withAge(parseInt(value(row, indexes, "age"), 18))
            .withSessionMinimumAge(parseInt(value(row, indexes, "session_min_age"), -1))
            .withMaximumDurationMinutes(parseInt(value(row, indexes, "max_duration_minutes"), -1))
            .withYearFrom(parseInt(value(row, indexes, "year_from"), Integer.MIN_VALUE))
            .withYearTo(parseInt(value(row, indexes, "year_to"), Integer.MAX_VALUE))
            .withMinimumRating(
                parseDouble(value(row, indexes, "min_rating"), -1),
                parseDouble(value(row, indexes, "rating_tolerance"), 0),
                parseBoolean(value(row, indexes, "rating_required"))
            )
            .allowRewatch(parseBoolean(value(row, indexes, "allow_rewatch")));

        addWatched(value(row, indexes, "watched"), preferences);
        addValues(value(row, indexes, "wishlist"), preferences::addWishlistMovie);
        addValues(value(row, indexes, "preferred_genres"), preferences::addLikedGenre);
        addValues(value(row, indexes, "disliked_genres"), preferences::addDislikedGenre);
        addValues(value(row, indexes, "preferred_languages"), preferences::addLikedLanguage);
        addValues(value(row, indexes, "disliked_languages"), preferences::addDislikedLanguage);
        addValues(value(row, indexes, "preferred_directors"), preferences::addPreferredDirector);
        addValues(value(row, indexes, "preferred_writers"), preferences::addPreferredWriter);
        addValues(value(row, indexes, "preferred_stars"), preferences::addPreferredStar);
        addValues(value(row, indexes, "preferred_countries"), preferences::addPreferredCountry);
        addValues(value(row, indexes, "preferred_subgenres"), preferences::addPreferredSubgenre);
        addValues(value(row, indexes, "preferred_pace"), preferences::addPreferredPace);
        addValues(value(row, indexes, "preferred_complexity"), preferences::addPreferredComplexity);
        addValues(value(row, indexes, "preferred_violence"), preferences::addPreferredViolence);
        addValues(value(row, indexes, "preferred_humor"), preferences::addPreferredHumor);
        addValues(value(row, indexes, "preferred_psychological_intensity"), preferences::addPreferredPsychologicalIntensity);
        addValues(value(row, indexes, "preferred_emotional_tones"), preferences::addPreferredEmotionalTone);
        addValues(value(row, indexes, "preferred_themes"), preferences::addPreferredTheme);
        addValues(value(row, indexes, "preferred_audience"), preferences::addPreferredAudience);
        addValues(value(row, indexes, "preferred_eras"), preferences::addPreferredEra);
        addValues(value(row, indexes, "preferred_popularity"), preferences::addPreferredPopularity);
        addValues(value(row, indexes, "required_languages"), preferences::addRequiredLanguage);
        addValues(value(row, indexes, "disliked_directors"), preferences::addDislikedDirector);
        addValues(value(row, indexes, "disliked_stars"), preferences::addDislikedStar);
        return preferences;
    }

    private static void addWatched(String rawValue, UserPreferences preferences) {
        for (String value : values(rawValue)) {
            String movieId = value.contains("=") ? value.substring(0, value.indexOf('=')) : value;
            preferences.addWatchedMovie(movieId);
        }
    }

    private static void addValues(String rawValue, ValueConsumer consumer) {
        values(rawValue).forEach(consumer::accept);
    }

    private static List<String> values(String rawValue) {
        List<String> values = new ArrayList<>();
        for (String value : rawValue.split("\\|")) {
            String normalized = value.trim();
            if (!normalized.isEmpty()) {
                values.add(normalized);
            }
        }
        return values;
    }

    private static List<String> parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean quoted = false;

        for (int i = 0; i < line.length(); i++) {
            char character = line.charAt(i);
            if (character == '"') {
                if (quoted && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    quoted = !quoted;
                }
            } else if (character == ',' && !quoted) {
                values.add(current.toString().trim());
                current.setLength(0);
            } else {
                current.append(character);
            }
        }

        values.add(current.toString().trim());
        return values;
    }

    private static Map<String, Integer> indexes(List<String> headers) {
        Map<String, Integer> indexes = new HashMap<>();
        for (int i = 0; i < headers.size(); i++) {
            indexes.put(headers.get(i), i);
        }
        return indexes;
    }

    private static String value(List<String> row, Map<String, Integer> indexes, String column) {
        Integer index = indexes.get(column);
        if (index == null || index >= row.size()) {
            return "";
        }
        return row.get(index);
    }

    private static int parseInt(String value, int fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException ignored) {
            return fallback;
        }
    }

    private static double parseDouble(String value, double fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        try {
            return Double.parseDouble(value.trim().replace(',', '.'));
        } catch (NumberFormatException ignored) {
            return fallback;
        }
    }

    private static boolean parseBoolean(String value) {
        return value != null && value.equalsIgnoreCase("true");
    }

    @FunctionalInterface
    private interface ValueConsumer {
        void accept(String value);
    }
}
