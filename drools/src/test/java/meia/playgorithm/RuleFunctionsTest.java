package meia.playgorithm;

import meia.playgorithm.facts.Limit;
import meia.playgorithm.facts.Movie;
import meia.playgorithm.facts.UserLimit;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** The helper functions the rules call, and the parsing of the raw movie data. */
public class RuleFunctionsTest {

    @Test
    void shouldApplyTheConservativeAgePolicy() {
        assertTrue(RuleFunctions.ageAllowed(18, null));
        assertTrue(RuleFunctions.ageAllowed(10, "PG"));
        assertTrue(RuleFunctions.ageAllowed(13, "PG-13"));
        assertFalse(RuleFunctions.ageAllowed(12, "PG-13"));
        assertFalse(RuleFunctions.ageAllowed(17, "R"));
        assertFalse(RuleFunctions.ageAllowed(17, "Not Rated"));
    }

    @Test
    void shouldPreferTheSessionMinimumAgeOverTheUserAge() {
        assertEquals(List.of(12), RuleFunctions.sessionAge(List.of("12"), 30));
        assertEquals(List.of(30), RuleFunctions.sessionAge(List.of(), 30));
        assertEquals(List.of(), RuleFunctions.sessionAge(List.of(), null));
    }

    @Test
    void shouldIgnoreTheToleranceWhenTheRatingIsMandatory() {
        UserLimit tolerance = new UserLimit("ana", Limit.RATING_TOLERANCE, "0.5");
        UserLimit required = new UserLimit("ana", Limit.RATING_REQUIRED, "true");

        assertEquals("0.5", RuleFunctions.effectiveTolerance(List.of(tolerance)));
        assertEquals("0", RuleFunctions.effectiveTolerance(List.of(tolerance, required)));
        assertEquals("0", RuleFunctions.effectiveTolerance(List.of()));
    }

    @Test
    void shouldNotTreatMissingDataAsMeetingALimit() {
        assertFalse(RuleFunctions.atMost(null, 150));
        assertTrue(RuleFunctions.atMost(140, 150));
        assertFalse(RuleFunctions.atLeast(null, 8));
        assertTrue(RuleFunctions.atLeast(8.2, 8));
    }

    @Test
    void shouldReadTheRawMovieData() {
        assertEquals(140, movie("2h 20m", "8,2").minutes());
        assertEquals(120, movie("2h", "8,2").minutes());
        assertEquals(95, movie("95m", "8,2").minutes());
        assertNull(movie("2h 75m", "8,2").minutes());
        assertEquals(8.2, movie("2h", "8,2").rating());
        assertEquals("8", movie("2h", "8").ratingText());
        assertNull(movie("2h", "").rating());
    }

    @Test
    void shouldScoreSimilarityWithItsWeights() {
        Movie a = new Movie("a", "A", 2000, 1, "", "", "", List.of("Nolan"), List.of(), List.of(),
            List.of("Action"), List.of("US"), List.of(), List.of("English"));
        Movie b = new Movie("b", "B", 2001, 1, "", "", "", List.of("Nolan"), List.of(), List.of(),
            List.of("Action", "Drama"), List.of("UK"), List.of(), List.of("English"));

        assertEquals(4 + 3 + 1, RuleFunctions.similarity(a, b));
    }

    private static Movie movie(String duration, String rating) {
        return new Movie("tt", "T", 2000, 1, duration, "PG", rating,
            List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), List.of());
    }
}
