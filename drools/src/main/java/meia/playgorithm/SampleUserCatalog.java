package meia.playgorithm;

import meia.playgorithm.facts.Attribute;
import meia.playgorithm.facts.Limit;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Loads knowledge_base_users.csv into user facts. It only reads data: every
 * inference is a rule.
 */
public final class SampleUserCatalog {

    private static final List<Path> CSV_CANDIDATES = List.of(
        Path.of("../swi-prolog/knowledge_base_users.csv"),
        Path.of("swi-prolog/knowledge_base_users.csv")
    );

    private SampleUserCatalog() {
    }

    public static Optional<UserProfile> find(String userId) {
        return users().stream()
            .filter(user -> user.id().equals(userId))
            .findFirst();
    }

    public static List<UserProfile> users() {
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

    private static List<UserProfile> usersFromCsv(Path path) {
        try {
            List<String> lines = Files.readAllLines(path);
            if (lines.size() < 2) {
                return List.of();
            }

            List<String> headers = CsvParser.parseLine(lines.get(0));
            Map<String, Integer> indexes = new HashMap<>();
            for (int i = 0; i < headers.size(); i++) {
                indexes.put(headers.get(i), i);
            }

            List<UserProfile> users = new ArrayList<>();
            for (int i = 1; i < lines.size(); i++) {
                if (!lines.get(i).isBlank()) {
                    users.add(userFromRow(CsvParser.parseLine(lines.get(i)), indexes));
                }
            }
            return users;
        } catch (IOException exception) {
            throw new IllegalStateException("Could not load user catalog from " + path, exception);
        }
    }

    private static UserProfile userFromRow(List<String> row, Map<String, Integer> indexes) {
        String ageText = value(row, indexes, "age");
        UserProfile.Builder user = UserProfile.builder(
            value(row, indexes, "user_id"),
            ageText.isEmpty() ? null : Integer.valueOf(ageText)
        );

        values(value(row, indexes, "wishlist")).forEach(user::wishlist);
        values(value(row, indexes, "preferred_genres")).forEach(genre -> user.likes(Attribute.GENRE, genre));
        values(value(row, indexes, "disliked_genres")).forEach(genre -> user.dislikes(Attribute.GENRE, genre));
        values(value(row, indexes, "preferred_languages")).forEach(language -> user.likes(Attribute.LANGUAGE, language));
        values(value(row, indexes, "disliked_languages")).forEach(language -> user.dislikes(Attribute.LANGUAGE, language));
        addWatched(value(row, indexes, "watched"), user);

        UserProfile.PREFERENCE_COLUMNS.forEach((column, attribute) ->
            values(value(row, indexes, column)).forEach(value -> user.prefers(attribute, value)));
        for (Limit limit : Limit.values()) {
            values(value(row, indexes, limit.key())).forEach(value -> user.limit(limit, value));
        }
        return user.build();
    }

    // Watched movies are "movie=rating" entries; old entries without a rating count as 0.
    private static void addWatched(String rawValue, UserProfile.Builder user) {
        for (String entry : values(rawValue)) {
            int separator = entry.indexOf('=');
            if (separator < 0) {
                user.watched(entry, 0);
            } else {
                user.watched(entry.substring(0, separator).trim(), Integer.parseInt(entry.substring(separator + 1).trim()));
            }
        }
    }

    private static String value(List<String> row, Map<String, Integer> indexes, String column) {
        Integer index = indexes.get(column);
        return index == null || index >= row.size() ? "" : row.get(index).trim();
    }

    /** Values separated by "|", with spaces normalized. */
    private static List<String> values(String rawValue) {
        List<String> values = new ArrayList<>();
        for (String value : rawValue.split("\\|")) {
            String normalized = value.trim().replaceAll("\\s+", " ");
            if (!normalized.isEmpty()) {
                values.add(normalized);
            }
        }
        return values;
    }
}
