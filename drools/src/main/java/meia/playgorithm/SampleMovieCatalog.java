package meia.playgorithm;

import meia.playgorithm.facts.Movie;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Loads knowledge_base_movies.csv into raw movie facts. Pace, audience, era
 * and every other
 * derived attribute are inferred by the rules in movies.drl.
 */
public final class SampleMovieCatalog {

    private static final List<Path> CSV_CANDIDATES = List.of(
        Path.of("../swi-prolog/knowledge_base_movies.csv"),
        Path.of("swi-prolog/knowledge_base_movies.csv")
    );

    private SampleMovieCatalog() {
    }

    public static List<Movie> movies() {
        return moviesFromCsv(findCatalogPath());
    }

    private static Path findCatalogPath() {
        return CSV_CANDIDATES.stream()
            .filter(Files::isRegularFile)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException(
                "Could not find swi-prolog/knowledge_base_movies.csv from the current directory."
            ));
    }

    private static List<Movie> moviesFromCsv(Path path) {
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

            List<Movie> movies = new ArrayList<>();
            for (int i = 1; i < lines.size(); i++) {
                if (!lines.get(i).isBlank()) {
                    movies.add(movieFromRow(CsvParser.parseLine(lines.get(i)), indexes));
                }
            }
            return movies;
        } catch (IOException exception) {
            throw new IllegalStateException("Could not load movie catalog from " + path, exception);
        }
    }

    private static Movie movieFromRow(List<String> row, Map<String, Integer> indexes) {
        return new Movie(
            value(row, indexes, "id"),
            value(row, indexes, "title"),
            integer(value(row, indexes, "year")),
            integer(value(row, indexes, "vote")),
            value(row, indexes, "duration"),
            value(row, indexes, "rating_mpa"),
            value(row, indexes, "rating_imdb"),
            values(value(row, indexes, "director")),
            values(value(row, indexes, "writer")),
            values(value(row, indexes, "star")),
            values(value(row, indexes, "genre")),
            values(value(row, indexes, "country_origin")),
            values(value(row, indexes, "production_company")),
            values(value(row, indexes, "language"))
        );
    }

    private static String value(List<String> row, Map<String, Integer> indexes, String column) {
        Integer index = indexes.get(column);
        return index == null || index >= row.size() ? "" : row.get(index);
    }

    /** Comma-separated values with spaces normalized; empty values are dropped. */
    private static List<String> values(String rawValue) {
        List<String> values = new ArrayList<>();
        for (String value : rawValue.split(",")) {
            String normalized = value.trim().replaceAll("\\s+", " ");
            if (!normalized.isEmpty()) {
                values.add(normalized);
            }
        }
        return values;
    }

    /** CSV numbers become integers; anything else is not a number (null). */
    private static Integer integer(String value) {
        try {
            return Integer.valueOf(value.trim());
        } catch (NumberFormatException ignored) {
            return null;
        }
    }
}
