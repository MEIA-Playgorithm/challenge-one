package meia.playgorithm.catalog;

import meia.playgorithm.model.Attribute;
import meia.playgorithm.model.Limit;
import meia.playgorithm.model.UserProfile;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** Lê o CSV de utilizadores para factos de utilizador. Só lê dados: as inferências são regras. */
@Component
public class UserCatalog {

    private static final List<Path> CSV_CANDIDATES = List.of(
        Path.of("../knowledge_base/users.csv"),
        Path.of("knowledge_base/users.csv")
    );

    // Utilizadores em memória: lidos no arranque e em reload().
    private List<UserProfile> users;

    public Optional<UserProfile> find(String userId) {
        return users().stream()
            .filter(user -> user.id().equals(userId))
            .findFirst();
    }

    public synchronized List<UserProfile> users() {
        if (users == null) {
            reload();
        }
        return users;
    }

    /** Relê o CSV; se for inválido lança IllegalStateException e mantém os utilizadores anteriores. */
    public synchronized void reload() {
        users = usersFromLines(readLines());
    }

    private static List<String> readLines() {
        try {
            return CsvSource.readLines(CsvSource.find("USERS_CSV", CSV_CANDIDATES));
        } catch (IOException exception) {
            throw new IllegalStateException("Could not read users CSV: " + exception.getMessage(), exception);
        }
    }

    private static List<UserProfile> usersFromLines(List<String> lines) {
        if (lines.size() < 2) {
            return List.of();
        }

        Map<String, Integer> indexes = indexes(CsvParser.parseLine(lines.get(0)));
        if (!indexes.containsKey("user_id")) {
            throw new IllegalStateException("Invalid users CSV: missing column user_id");
        }

        List<UserProfile> users = new ArrayList<>();
        for (int i = 1; i < lines.size(); i++) {
            if (!lines.get(i).isBlank()) {
                users.add(userFromRow(CsvParser.parseLine(lines.get(i)), indexes));
            }
        }
        return List.copyOf(users);
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

    // Os filmes vistos são entradas "filme=avaliação"; entradas sem avaliação contam como 0.
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

    private static Map<String, Integer> indexes(List<String> headers) {
        Map<String, Integer> indexes = new HashMap<>();
        for (int i = 0; i < headers.size(); i++) {
            indexes.put(headers.get(i), i);
        }
        return indexes;
    }

    private static String value(List<String> row, Map<String, Integer> indexes, String column) {
        Integer index = indexes.get(column);
        return index == null || index >= row.size() ? "" : row.get(index).trim();
    }

    /** Valores separados por "|", com os espaços normalizados. */
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
