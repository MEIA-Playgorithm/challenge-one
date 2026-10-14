package meia.playgorithm;

import java.util.List;
import java.util.Scanner;
import java.util.function.Consumer;

public class MovieRecommendationConsole {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("Playgorithm Drools knowledge-base console");
        System.out.println("Answer the initial questions. Leave optional fields empty to skip them.");
        System.out.println();

        UserPreferences preferences = readPreferences(scanner);
        List<Movie> movies = SampleMovieCatalog.movies();
        RecommendationResult result = new DroolsRecommendationService()
            .evaluate(preferences, movies);

        System.out.println();
        System.out.println("Loaded " + movies.size() + " movie facts from the Prolog CSV catalog.");
        printRecommendations(result.recommendations());
        printHelp();
        commandLoop(scanner, result);
    }

    private static UserPreferences readPreferences(Scanner scanner) {
        UserPreferences preferences = UserPreferences.forUser(readText(scanner, "User id", "demo"))
            .withAge(readInt(scanner, "Candidate age", 18));

        int maxDuration = readOptionalInt(scanner, "Maximum duration in minutes");
        if (maxDuration > 0) {
            preferences.withMaximumDurationMinutes(maxDuration);
        }

        int yearFrom = readOptionalInt(scanner, "Minimum release year");
        if (yearFrom > 0) {
            preferences.withYearFrom(yearFrom);
        }

        int yearTo = readOptionalInt(scanner, "Maximum release year");
        if (yearTo > 0) {
            preferences.withYearTo(yearTo);
        }

        double minimumRating = readOptionalDouble(scanner, "Minimum IMDb rating");
        if (minimumRating >= 0) {
            boolean required = readYesNo(scanner, "Is the rating mandatory?");
            double tolerance = required ? 0 : readOptionalDouble(scanner, "Allowed rating tolerance");
            preferences.withMinimumRating(minimumRating, Math.max(tolerance, 0), required);
        }

        readList(scanner, "Liked genres", preferences::addLikedGenre);
        readList(scanner, "Mandatory genres", preferences::addMandatoryGenre);
        readList(scanner, "Disliked genres", preferences::addDislikedGenre);
        readList(scanner, "Liked languages", preferences::addLikedLanguage);
        readList(scanner, "Required languages", preferences::addRequiredLanguage);
        readList(scanner, "Disliked languages", preferences::addDislikedLanguage);
        readList(scanner, "Preferred directors", preferences::addPreferredDirector);
        readList(scanner, "Mandatory directors", preferences::addMandatoryDirector);
        readList(scanner, "Disliked directors", preferences::addDislikedDirector);
        readList(scanner, "Preferred writers", preferences::addPreferredWriter);
        readList(scanner, "Preferred actors", preferences::addPreferredStar);
        readList(scanner, "Mandatory actors", preferences::addMandatoryStar);
        readList(scanner, "Disliked actors", preferences::addDislikedStar);
        readList(scanner, "Preferred countries", preferences::addPreferredCountry);
        readList(scanner, "Preferred subgenres", preferences::addPreferredSubgenre);
        readList(scanner, "Preferred pace (slow, medium, fast)", preferences::addPreferredPace);
        readList(scanner, "Preferred complexity (low, medium, high)", preferences::addPreferredComplexity);
        readList(scanner, "Preferred violence (low, medium, high)", preferences::addPreferredViolence);
        readList(scanner, "Preferred humor (low, medium, high)", preferences::addPreferredHumor);
        readList(scanner, "Preferred psychological intensity (low, medium, high)", preferences::addPreferredPsychologicalIntensity);
        readList(scanner, "Preferred emotional tones", preferences::addPreferredEmotionalTone);
        readList(scanner, "Preferred themes", preferences::addPreferredTheme);
        readList(scanner, "Preferred audience (mainstream, niche)", preferences::addPreferredAudience);
        readList(scanner, "Preferred eras (classic, modern, recent)", preferences::addPreferredEra);
        readList(scanner, "Preferred popularity (very_popular, popular, less_popular)", preferences::addPreferredPopularity);
        return preferences;
    }

    private static void commandLoop(Scanner scanner, RecommendationResult result) {
        while (true) {
            System.out.print("> ");
            if (!scanner.hasNextLine()) {
                return;
            }

            String command = scanner.nextLine().trim();
            if (command.isEmpty()) {
                continue;
            }
            if (command.equalsIgnoreCase("exit") || command.equalsIgnoreCase("quit")) {
                return;
            }
            if (command.equalsIgnoreCase("help")) {
                printHelp();
            } else if (command.equalsIgnoreCase("recommend") || command.equalsIgnoreCase("recommendations")) {
                printRecommendations(result.recommendations());
            } else if (command.equalsIgnoreCase("facts") || command.equalsIgnoreCase("movies")) {
                printFacts(result.movies());
            } else if (command.equalsIgnoreCase("trace")) {
                printTrace(result.traceEvents());
            } else if (command.startsWith("why-not ")) {
                explainWhyNot(result, command.substring("why-not ".length()).trim());
            } else if (command.startsWith("how ")) {
                explainHow(result, command.substring("how ".length()).trim());
            } else if (command.startsWith("why ")) {
                System.out.println("'why' is reserved for goal/question explanations. Use how <movie> for the inference path.");
            } else {
                System.out.println("Unknown command. Type help to see the available commands.");
            }
        }
    }

    private static void printHelp() {
        System.out.println();
        System.out.println("Knowledge-base commands");
        System.out.println("- recommend             show the inferred recommendations");
        System.out.println("- how <movie title/id>  explain how a movie was recommended");
        System.out.println("- why-not <title/id>    explain why a movie was not recommended");
        System.out.println("- trace                 show the fired rule trace");
        System.out.println("- facts                 list the sample movie facts");
        System.out.println("- exit                  close the console");
        System.out.println();
    }

    private static void printRecommendations(List<Recommendation> recommendations) {
        System.out.println();
        System.out.println("Recommendations");
        if (recommendations.isEmpty()) {
            System.out.println("No eligible movies found.");
            return;
        }

        for (Recommendation recommendation : recommendations) {
            System.out.printf(
                "- %s | score %.2f | %s%n",
                recommendation.getMovieTitle(),
                recommendation.getScore(),
                recommendation.getStatus()
            );
            System.out.println("  reasons: " + String.join(", ", recommendation.getReasons()));
            if (!recommendation.getUnmetPreferences().isEmpty()) {
                System.out.println("  unmet preferences: " + String.join(", ", recommendation.getUnmetPreferences()));
            }
            System.out.println("  score breakdown: " + recommendation.getScoreBreakdown());
        }
    }

    private static void explainHow(RecommendationResult result, String query) {
        result.findRecommendation(query).ifPresentOrElse(
            recommendation -> {
                System.out.println();
                System.out.println("How explanation for " + recommendation.getMovieTitle());
                System.out.printf(
                    "It was recommended as %s with score %.2f.%n",
                    recommendation.getStatus(),
                    recommendation.getScore()
                );
                System.out.println("Satisfied preferences: " + String.join(", ", recommendation.getReasons()));
                if (!recommendation.getUnmetPreferences().isEmpty()) {
                    System.out.println("Unmet flexible preferences: " + String.join(", ", recommendation.getUnmetPreferences()));
                }
                System.out.println("Score breakdown: " + recommendation.getScoreBreakdown());
                printTrace(result.traceFor(recommendation.getMovieId()));
            },
            () -> {
                System.out.println("That movie was not recommended. Use why-not " + query + " for the rejection path.");
            }
        );
    }

    private static void explainWhyNot(RecommendationResult result, String query) {
        result.findMovie(query).ifPresentOrElse(
            movie -> {
                if (result.findRecommendation(movie.getId()).isPresent()) {
                    System.out.println(movie.getTitle() + " was recommended. Use how " + movie.getTitle() + " to inspect it.");
                    return;
                }

                List<TraceEvent> trace = result.traceFor(movie);
                List<TraceEvent> exclusions = trace.stream()
                    .filter(event -> event.type().equals("EXCLUSION"))
                    .toList();
                List<TraceEvent> preferences = trace.stream()
                    .filter(event -> event.type().equals("PREFERENCE"))
                    .toList();

                System.out.println();
                System.out.println("Why-not explanation for " + movie.getTitle());
                if (!exclusions.isEmpty()) {
                    System.out.println("The movie was discarded because mandatory or rejection rules fired:");
                    exclusions.forEach(event -> System.out.println("- " + event.rule() + ": " + event.details()));
                    return;
                }
                if (preferences.isEmpty()) {
                    System.out.println("No exclusion fired, but no positive preference rule matched either.");
                    System.out.println("The recommendation rule requires at least one preference reason.");
                    return;
                }
                System.out.println("Positive preference rules fired, but the final recommendation was not created.");
                printTrace(trace);
            },
            () -> System.out.println("Unknown movie. Use facts to see the available sample movies.")
        );
    }

    private static void printFacts(List<Movie> movies) {
        System.out.println();
        System.out.println("Sample movie facts");
        for (Movie movie : movies) {
            System.out.printf(
                "- %s (%s, %d) | genres=%s | languages=%s | directors=%s | stars=%s | rating=%.1f | mpa=%s%n",
                movie.getTitle(),
                movie.getId(),
                movie.getYear(),
                movie.getGenres(),
                movie.getLanguages(),
                movie.getDirectors(),
                movie.getStars(),
                movie.getRatingImdb(),
                movie.getRatingMpa()
            );
        }
    }

    private static void printTrace(List<TraceEvent> traceEvents) {
        System.out.println();
        System.out.println("Rule trace");
        if (traceEvents.isEmpty()) {
            System.out.println("No trace events were created.");
            return;
        }

        for (TraceEvent event : traceEvents) {
            System.out.printf(
                "- [%s] %s -> %s: %s%n",
                event.type(),
                event.rule(),
                event.movieTitle(),
                event.details()
            );
        }
    }

    private static String readText(Scanner scanner, String label, String fallback) {
        System.out.print(label + " [" + fallback + "]: ");
        String value = scanner.nextLine().trim();
        return value.isEmpty() ? fallback : value;
    }

    private static int readInt(Scanner scanner, String label, int fallback) {
        while (true) {
            System.out.print(label + " [" + fallback + "]: ");
            String value = scanner.nextLine().trim();
            if (value.isEmpty()) {
                return fallback;
            }
            try {
                return Integer.parseInt(value);
            } catch (NumberFormatException ignored) {
                System.out.println("Please enter a valid integer.");
            }
        }
    }

    private static int readOptionalInt(Scanner scanner, String label) {
        while (true) {
            System.out.print(label + ": ");
            String value = scanner.nextLine().trim();
            if (value.isEmpty()) {
                return -1;
            }
            try {
                return Integer.parseInt(value);
            } catch (NumberFormatException ignored) {
                System.out.println("Please enter a valid integer.");
            }
        }
    }

    private static double readOptionalDouble(Scanner scanner, String label) {
        while (true) {
            System.out.print(label + ": ");
            String value = scanner.nextLine().trim().replace(',', '.');
            if (value.isEmpty()) {
                return -1;
            }
            try {
                return Double.parseDouble(value);
            } catch (NumberFormatException ignored) {
                System.out.println("Please enter a valid number.");
            }
        }
    }

    private static boolean readYesNo(Scanner scanner, String label) {
        while (true) {
            System.out.print(label + " [y/N]: ");
            String value = scanner.nextLine().trim();
            if (value.isEmpty()) {
                return false;
            }
            if (value.equalsIgnoreCase("y") || value.equalsIgnoreCase("yes")) {
                return true;
            }
            if (value.equalsIgnoreCase("n") || value.equalsIgnoreCase("no")) {
                return false;
            }
            System.out.println("Please answer y or n.");
        }
    }

    private static void readList(Scanner scanner, String label, Consumer<String> consumer) {
        System.out.print(label + " (comma separated): ");
        String value = scanner.nextLine().trim();
        if (value.isEmpty()) {
            return;
        }
        for (String item : value.split(",")) {
            String normalized = item.trim();
            if (!normalized.isEmpty()) {
                consumer.accept(normalized);
            }
        }
    }
}
