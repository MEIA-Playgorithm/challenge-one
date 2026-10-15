package meia.playgorithm;

import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

public final class SampleMovieCatalog {

    private static final List<Path> CSV_CANDIDATES = List.of(
        Path.of("../knowledge_base/movies.csv"),
        Path.of("knowledge_base/movies.csv")
    );
    private static final int MAINSTREAM_THRESHOLD = 500_000;
    private static final Map<String, Map<String, List<String>>> LEVEL_HINTS = levelHints();
    private static final Map<String, Map<String, List<String>>> TAG_HINTS = tagHints();
    private static final Set<String> KNOWN_SUBGENRES = Set.of(
        "Action Epic", "Adult Animation", "Adventure Epic", "Anime",
        "Buddy Comedy", "ComingofAge", "Computer Animation", "Cop Drama",
        "Cyberpunk", "Dark Comedy", "Globetrotting Adventure", "HandDrawn Animation",
        "Heist", "HighConcept Comedy", "Holiday Family", "Jungle Adventure",
        "Kaiju", "Legal Drama", "Mockumentary", "OnePerson Army Action", "Parody",
        "Period Drama", "Psychological Drama", "Psychological Horror",
        "Psychological Thriller", "Quest", "Road Trip", "Romantic Comedy",
        "Romantic Epic", "Satire", "SciFi Epic", "Sea Adventure", "Slapstick",
        "Slasher Horror", "Splatter Horror", "Superhero", "Supernatural Fantasy",
        "Suspense Mystery", "Swashbuckler", "Sword Sandal", "True Crime", "Wuxia"
    );

    private SampleMovieCatalog() {
    }

    public static List<Movie> movies() {
        return moviesFromCsv(findCatalogSource());
    }

    public static int count() {
        return movies().size();
    }

    private static String findCatalogSource() {
        return CsvSource.find("MOVIES_CSV", CSV_CANDIDATES);
    }

    private static List<Movie> moviesFromCsv(String source) {
        try {
            List<String> lines = CsvSource.readLines(source);
            if (lines.size() < 2) {
                return List.of();
            }

            List<String> headers = parseCsvLine(lines.get(0));
            Map<String, Integer> indexes = indexes(headers);
            List<Movie> movies = new ArrayList<>();

            for (int i = 1; i < lines.size(); i++) {
                if (!lines.get(i).isBlank()) {
                    movies.add(movieFromRow(parseCsvLine(lines.get(i)), indexes));
                }
            }

            return movies;
        } catch (IOException exception) {
            throw new IllegalStateException("Could not load movie catalog from " + source, exception);
        }
    }

    private static Movie movieFromRow(List<String> row, Map<String, Integer> indexes) {
        int year = parseInt(value(row, indexes, "year"), 0);
        Movie movie = Movie.identified(
            value(row, indexes, "id"),
            value(row, indexes, "title"),
            year
        )
            .withDurationMinutes(parseDuration(value(row, indexes, "duration")))
            .withRatingMpa(value(row, indexes, "rating_mpa"))
            .withRatingImdb(parseDouble(value(row, indexes, "rating_imdb")))
            .withEra(era(year))
            .withPopularity(popularity(parseInt(value(row, indexes, "vote"), 0)))
            .withAudience(audience(parseInt(value(row, indexes, "vote"), -1)));

        addValues(value(row, indexes, "director"), movie::addDirector);
        addValues(value(row, indexes, "writer"), movie::addWriter);
        addValues(value(row, indexes, "star"), movie::addStar);
        List<String> genres = values(value(row, indexes, "genre"));
        genres.forEach(movie::addGenre);
        genres.stream()
            .filter(KNOWN_SUBGENRES::contains)
            .forEach(movie::addSubgenre);
        addValues(value(row, indexes, "country_origin"), movie::addCountry);
        addValues(value(row, indexes, "language"), movie::addLanguage);
        addInferredAttributes(movie, genres);

        return movie;
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

    private static void addValues(String rawValue, ValueConsumer consumer) {
        values(rawValue).forEach(consumer::accept);
    }

    private static List<String> values(String rawValue) {
        List<String> values = new ArrayList<>();
        for (String value : rawValue.split(",")) {
            String normalized = value.trim();
            if (!normalized.isEmpty()) {
                values.add(normalized);
            }
        }
        return values;
    }

    private static void addInferredAttributes(Movie movie, List<String> genres) {
        movie.withPace(level("pace", genres));
        movie.withComplexity(level("complexity", genres));
        movie.withViolence(level("violence", genres));
        movie.withHumor(level("humor", genres));
        movie.withPsychologicalIntensity(level("psychological_intensity", genres));
        tags("emotional_tone", genres).forEach(movie::addEmotionalTone);
        tags("themes", genres).forEach(movie::addTheme);
    }

    private static String level(String attribute, List<String> genres) {
        for (Map.Entry<String, List<String>> hint : LEVEL_HINTS.get(attribute).entrySet()) {
            if (sharesGenre(genres, hint.getValue())) {
                return hint.getKey();
            }
        }
        return "unknown";
    }

    private static Set<String> tags(String attribute, List<String> genres) {
        Set<String> tags = new LinkedHashSet<>();
        for (Map.Entry<String, List<String>> hint : TAG_HINTS.get(attribute).entrySet()) {
            if (sharesGenre(genres, hint.getValue())) {
                tags.add(hint.getKey());
            }
        }
        if (tags.isEmpty()) {
            tags.add("unknown");
        }
        return tags;
    }

    private static boolean sharesGenre(List<String> genres, List<String> hints) {
        return hints.stream().anyMatch(genres::contains);
    }

    private static int parseDuration(String value) {
        int minutes = 0;
        for (String part : value.split(" ")) {
            if (part.endsWith("h")) {
                minutes += parseInt(part.substring(0, part.length() - 1), 0) * 60;
            } else if (part.endsWith("m")) {
                minutes += parseInt(part.substring(0, part.length() - 1), 0);
            }
        }
        return minutes;
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

    private static double parseDouble(String value) {
        if (value == null || value.isBlank()) {
            return 0;
        }
        try {
            return Double.parseDouble(value.trim().replace(',', '.'));
        } catch (NumberFormatException ignored) {
            return 0;
        }
    }

    private static String era(int year) {
        if (year <= 0) {
            return null;
        }
        if (year < 2000) {
            return "classic";
        }
        if (year < 2020) {
            return "modern";
        }
        return "recent";
    }

    private static String popularity(int votes) {
        if (votes >= 1_000_000) {
            return "very_popular";
        }
        if (votes >= 500_000) {
            return "popular";
        }
        return "less_popular";
    }

    private static String audience(int votes) {
        if (votes < 0) {
            return "unknown";
        }
        return votes >= MAINSTREAM_THRESHOLD ? "mainstream" : "niche";
    }

    private static Map<String, Map<String, List<String>>> levelHints() {
        Map<String, Map<String, List<String>>> hints = new HashMap<>();
        hints.put("pace", orderedMap(
            hint("fast", "Action", "Adventure", "Thriller", "Slapstick"),
            hint("slow", "Psychological Drama", "Period Drama", "Documentary"),
            hint("medium", "Drama", "Comedy", "Romance", "Family")
        ));
        hints.put("complexity", orderedMap(
            hint("high", "Psychological Thriller", "Psychological Drama", "Mystery", "Suspense Mystery", "Cyberpunk", "Legal Drama"),
            hint("medium", "Crime", "SciFi", "Fantasy", "History", "Drama"),
            hint("low", "Slapstick", "Holiday Family", "Family")
        ));
        hints.put("violence", orderedMap(
            hint("high", "Splatter Horror", "Slasher Horror", "War", "OnePerson Army Action"),
            hint("medium", "Action", "Crime", "Horror", "Western", "Wuxia"),
            hint("low", "Family", "Romantic Comedy", "Holiday Family")
        ));
        hints.put("humor", orderedMap(
            hint("high", "Comedy", "Slapstick", "Parody", "Buddy Comedy", "Dark Comedy", "Romantic Comedy", "HighConcept Comedy"),
            hint("medium", "Satire", "Mockumentary"),
            hint("low", "Tragedy", "Psychological Horror", "War")
        ));
        hints.put("psychological_intensity", orderedMap(
            hint("high", "Psychological Thriller", "Psychological Horror", "Psychological Drama", "Tragedy"),
            hint("medium", "Thriller", "Suspense Mystery", "Horror", "Mystery", "Crime", "War", "Drama"),
            hint("low", "Family", "Slapstick", "Holiday Family")
        ));
        return hints;
    }

    private static Map<String, Map<String, List<String>>> tagHints() {
        Map<String, Map<String, List<String>>> hints = new HashMap<>();
        hints.put("emotional_tone", orderedMap(
            hint("tense", "Thriller", "Suspense Mystery", "Crime"),
            hint("dark", "Horror", "Psychological Horror", "Psychological Thriller", "Dark Comedy", "Cyberpunk"),
            hint("sad", "Tragedy"),
            hint("lighthearted", "Comedy", "Romantic Comedy", "Slapstick", "Holiday Family"),
            hint("romantic", "Romance", "Romantic Comedy", "Romantic Epic"),
            hint("reflective", "Psychological Drama", "Biography", "Drama"),
            hint("exciting", "Action", "Adventure", "Superhero")
        ));
        hints.put("themes", orderedMap(
            hint("love", "Romance", "Romantic Comedy", "Romantic Epic"),
            hint("family", "Family", "Holiday Family"),
            hint("growing_up", "ComingofAge"),
            hint("crime", "Crime", "True Crime", "Heist", "Cop Drama"),
            hint("justice", "Legal Drama", "Cop Drama", "Superhero"),
            hint("war", "War"),
            hint("history", "History", "Period Drama", "Sword Sandal"),
            hint("technology", "SciFi", "SciFi Epic", "Cyberpunk"),
            hint("supernatural", "Supernatural Fantasy", "Fantasy"),
            hint("exploration", "Adventure", "Quest", "Sea Adventure", "Jungle Adventure", "Globetrotting Adventure"),
            hint("psychology", "Psychological Drama", "Psychological Thriller", "Psychological Horror"),
            hint("music", "Music", "Musical"),
            hint("sport", "Sport"),
            hint("life_story", "Biography")
        ));
        return hints;
    }

    private static Map<String, List<String>> orderedMap(Hint... hints) {
        Map<String, List<String>> map = new LinkedHashMap<>();
        for (Hint hint : hints) {
            map.put(hint.value(), hint.genres());
        }
        return map;
    }

    private static Hint hint(String value, String... genres) {
        return new Hint(value, List.of(genres));
    }

    private record Hint(String value, List<String> genres) {
    }

    @FunctionalInterface
    private interface ValueConsumer {
        void accept(String value);
    }
}
