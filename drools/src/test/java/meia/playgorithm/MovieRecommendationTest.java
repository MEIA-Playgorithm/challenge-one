package meia.playgorithm;

import meia.playgorithm.facts.Attribute;
import meia.playgorithm.facts.Limit;
import meia.playgorithm.facts.Movie;
import meia.playgorithm.facts.MovieCategory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Expected results of the knowledge base for every user of the CSV catalogs:
 * expected-recommendations.csv and expected-exclusions.csv.
 */
public class MovieRecommendationTest {

    private static KnowledgeBaseResult knowledgeBase;

    @BeforeAll
    static void runKnowledgeBase() {
        knowledgeBase = new DroolsRecommendationService().runCatalogs();
    }

    @Test
    void shouldGiveTheExpectedRecommendations() throws IOException {
        Map<String, List<String>> expected = csvRows("/expected-recommendations.csv").stream()
            .collect(Collectors.groupingBy(row -> row.get(0), Collectors.mapping(
                row -> row.get(1) + " | " + Double.parseDouble(row.get(2)) + " | " + row.get(3) + " | " + sortedReasons(row.get(4)),
                Collectors.toList())));

        for (String userId : knowledgeBase.userIds()) {
            List<String> actual = knowledgeBase.forUser(userId).recommendations().stream()
                .map(recommendation -> recommendation.getMovieId() + " | " + recommendation.getScore() + " | "
                    + recommendation.getStatus() + " | " + sortedReasons(String.join(";", recommendation.getReasons())))
                .toList();
            assertEquals(expected.getOrDefault(userId, List.of()), actual, "recommendations of " + userId);
        }
    }

    @Test
    void shouldInferTheExpectedExclusionReasons() throws IOException {
        TreeSet<String> expected = csvRows("/expected-exclusions.csv").stream()
            .map(row -> row.get(0) + "," + row.get(1) + "," + row.get(2))
            .collect(Collectors.toCollection(TreeSet::new));
        TreeSet<String> actual = knowledgeBase.exclusionReasons().stream()
            .map(reason -> reason.userId() + "," + reason.movieId() + "," + reason.label())
            .collect(Collectors.toCollection(TreeSet::new));

        assertEquals(expected, actual);
    }

    @Test
    void shouldInferTheMovieProfileWithTheMovieRules() {
        String batman = "tt0372784";

        assertEquals("fast", knowledgeBase.feature(batman, Attribute.PACE).orElseThrow());
        assertEquals("medium", knowledgeBase.feature(batman, Attribute.COMPLEXITY).orElseThrow());
        assertEquals("medium", knowledgeBase.feature(batman, Attribute.VIOLENCE).orElseThrow());
        assertEquals("low", knowledgeBase.feature(batman, Attribute.HUMOR).orElseThrow());
        assertEquals("high", knowledgeBase.feature(batman, Attribute.PSYCHOLOGICAL_INTENSITY).orElseThrow());
        assertEquals("mainstream", knowledgeBase.feature(batman, Attribute.AUDIENCE).orElseThrow());
        assertEquals("modern", knowledgeBase.feature(batman, Attribute.ERA).orElseThrow());
        assertEquals("very_popular", knowledgeBase.feature(batman, Attribute.POPULARITY).orElseThrow());
        assertEquals(List.of("exciting", "reflective", "sad"),
            knowledgeBase.features(batman, Attribute.EMOTIONAL_TONE).stream().sorted().toList());
        assertTrue(knowledgeBase.features(batman, Attribute.THEMES).contains("justice"));
        assertTrue(knowledgeBase.features(batman, Attribute.SUBGENRE).containsAll(List.of("Action Epic", "Superhero")));
        assertTrue(knowledgeBase.movieClasses().stream()
            .anyMatch(fact -> fact.movieId().equals(batman) && fact.category() == MovieCategory.MAINSTREAM));
    }

    @Test
    void shouldExplainEachInferenceWithTheRuleThatMadeIt() {
        RecommendationResult ana = knowledgeBase.forUser("ana");
        Movie psycho = ana.findMovie("Psycho").orElseThrow();
        Movie batman = ana.findMovie("Batman Begins").orElseThrow();

        assertEquals(List.of("Disliked director", "Disliked genre", "Disliked star"),
            ana.exclusions(psycho).stream().map(reason -> reason.rule()).sorted().toList());
        assertTrue(ana.preferences(batman).stream()
            .anyMatch(reason -> reason.rule().equals("Liked genre or language") && reason.label().equals("genre(Action)")));
    }

    @Test
    void shouldLoadTheCsvCatalogs() {
        assertEquals(100, knowledgeBase.movies().size());
        assertEquals(List.of("ana", "bruno", "carla", "diogo", "eva", "filipe", "ines", "joao", "mariana", "tiago"),
            knowledgeBase.userIds());

        UserProfile ana = knowledgeBase.user("ana").orElseThrow();
        assertEquals(25, ana.user().age());
        assertTrue(ana.watched().stream().anyMatch(watched -> watched.movieId().equals("tt0087469") && watched.rating() == 4));
        assertTrue(ana.limits().stream().anyMatch(limit -> limit.limit() == Limit.RATING_REQUIRED && limit.value().equals("true")));
    }

    /** Reasons compared as a sorted list, so the test does not depend on how ties are printed. */
    private static String sortedReasons(String reasons) {
        return Arrays.stream(reasons.split(";")).filter(reason -> !reason.isBlank()).sorted().toList().toString();
    }

    private static List<List<String>> csvRows(String resource) throws IOException {
        try (InputStream input = MovieRecommendationTest.class.getResourceAsStream(resource)) {
            String[] lines = new String(input.readAllBytes(), StandardCharsets.UTF_8).split("\\R");
            List<List<String>> rows = new ArrayList<>();
            for (int i = 1; i < lines.length; i++) {
                if (!lines[i].isBlank()) {
                    rows.add(CsvParser.parseLine(lines[i]));
                }
            }
            return rows;
        }
    }
}
