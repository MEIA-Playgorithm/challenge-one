package meia.playgorithm.engine;

import meia.playgorithm.model.Limit;
import meia.playgorithm.model.Movie;
import meia.playgorithm.model.UserLimit;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

/**
 * Helper functions the rules call (imported in movies.drl and users.drl with
 * "import function"). They only compute values; every decision is made in a
 * rule.
 */
public final class RuleFunctions {

    private RuleFunctions() {
    }

    /** The two lists have a value in common. */
    public static boolean sharesAny(List<String> left, List<String> right) {
        for (String value : left) {
            if (right.contains(value)) {
                return true;
            }
        }
        return false;
    }

    /** The distinct values of a list, sorted. */
    public static List<String> sortedDistinct(List<String> values) {
        return new ArrayList<>(new TreeSet<>(values));
    }

    /** Weighted similarity of two movies: shared directors, genres, countries and languages. */
    public static int similarity(Movie a, Movie b) {
        return (sharesAny(a.genres(), b.genres()) ? 4 : 0)
            + (sharesAny(a.directors(), b.directors()) ? 3 : 0)
            + (sharesAny(a.writers(), b.writers()) ? 2 : 0)
            + (sharesAny(a.countries(), b.countries()) ? 1 : 0)
            + (sharesAny(a.languages(), b.languages()) ? 1 : 0);
    }

    /** Age check with a conservative policy; for minors, unknown MPA ratings are excluded. */
    public static boolean ageAllowed(int age, String ratingMpa) {
        if (age >= 18) {
            return true;
        }
        if ("G".equals(ratingMpa) || "PG".equals(ratingMpa)) {
            return true;
        }
        return "PG-13".equals(ratingMpa) && age >= 13;
    }

    /** The session minimum age when given, otherwise the user age (none when both are missing). */
    public static List<Integer> sessionAge(List<String> sessionMinAges, Integer userAge) {
        List<Integer> ages = new ArrayList<>();
        if (!sessionMinAges.isEmpty()) {
            ages.add((int) Double.parseDouble(sessionMinAges.get(0)));
        } else if (userAge != null) {
            ages.add(userAge);
        }
        return ages;
    }

    /** The rating tolerance; none when the rating is mandatory. */
    public static String effectiveTolerance(List<UserLimit> settings) {
        String tolerance = "0";
        for (UserLimit setting : settings) {
            if (setting.limit() == Limit.RATING_REQUIRED && setting.value().equals("true")) {
                return "0";
            }
            if (setting.limit() == Limit.RATING_TOLERANCE) {
                tolerance = setting.numberText();
            }
        }
        return tolerance;
    }

    /** Missing data does not prove that a limit is met. */
    public static boolean atMost(Integer value, double maximum) {
        return value != null && value <= maximum;
    }

    /** Missing data does not prove that a limit is met. */
    public static boolean atLeast(Number value, double minimum) {
        return value != null && value.doubleValue() >= minimum;
    }

    /** A sorted list written as [a,b]. */
    public static String listText(List<String> values) {
        return "[" + String.join(",", new TreeSet<>(values)) + "]";
    }
}
