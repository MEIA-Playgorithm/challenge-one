package meia.playgorithm.catalog;

import meia.playgorithm.model.Movie;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Lê o CSV de filmes para factos de filme em bruto. O ritmo, o público, a era e os
 * restantes atributos derivados são inferidos pelas regras de movies.drl.
 */
@Component
public class MovieCatalog {

    private static final List<Path> CSV_CANDIDATES = List.of(
        Path.of("../knowledge_base/movies.csv"),
        Path.of("knowledge_base/movies.csv")
    );

    // Filmes em memória: lidos no arranque e em reload().
    private List<Movie> movies;

    public synchronized List<Movie> movies() {
        if (movies == null) {
            reload();
        }
        return movies;
    }

    /** Relê o CSV; se for inválido lança IllegalStateException e mantém os filmes anteriores. */
    public synchronized void reload() {
        movies = moviesFromLines(readLines());
    }

    private static List<String> readLines() {
        try {
            return CsvSource.readLines(CsvSource.find("MOVIES_CSV", CSV_CANDIDATES));
        } catch (IOException exception) {
            throw new IllegalStateException("Could not read movies CSV: " + exception.getMessage(), exception);
        }
    }

    private static List<Movie> moviesFromLines(List<String> lines) {
        if (lines.size() < 2) {
            return List.of();
        }

        Map<String, Integer> indexes = indexes(CsvParser.parseLine(lines.get(0)));
        if (!indexes.containsKey("id")) {
            throw new IllegalStateException("Invalid movies CSV: missing column id");
        }

        List<Movie> movies = new ArrayList<>();
        for (int i = 1; i < lines.size(); i++) {
            if (!lines.get(i).isBlank()) {
                movies.add(movieFromRow(CsvParser.parseLine(lines.get(i)), indexes));
            }
        }
        return List.copyOf(movies);
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

    private static Map<String, Integer> indexes(List<String> headers) {
        Map<String, Integer> indexes = new HashMap<>();
        for (int i = 0; i < headers.size(); i++) {
            indexes.put(headers.get(i), i);
        }
        return indexes;
    }

    private static String value(List<String> row, Map<String, Integer> indexes, String column) {
        Integer index = indexes.get(column);
        return index == null || index >= row.size() ? "" : row.get(index);
    }

    /** Valores separados por vírgula, com os espaços normalizados; os vazios são ignorados. */
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

    /** Os números do CSV passam a inteiros; o resto não é número (null). */
    private static Integer integer(String value) {
        try {
            return Integer.valueOf(value.trim());
        } catch (NumberFormatException ignored) {
            return null;
        }
    }
}
