package meia.playgorithm.console;

import meia.playgorithm.catalog.MovieCatalog;
import meia.playgorithm.catalog.UserCatalog;
import meia.playgorithm.engine.DroolsRecommendationService;
import meia.playgorithm.engine.KnowledgeBaseResult;
import meia.playgorithm.engine.RecommendationResult;
import meia.playgorithm.model.Attribute;
import meia.playgorithm.model.Movie;
import meia.playgorithm.model.Recommendation;
import meia.playgorithm.model.TraceEvent;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

/**
 * Interactive Drools console. The movie and user CSV catalogs are loaded and
 * the recommendation knowledge base runs for every user straight away.
 */
public class MovieRecommendationConsole {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("Playgorithm Drools knowledge-base console");

        KnowledgeBaseResult knowledgeBase = new DroolsRecommendationService().run(new MovieCatalog().movies(), new UserCatalog().users());
        Map<String, RecommendationResult> results = new LinkedHashMap<>();
        knowledgeBase.userIds().forEach(userId -> results.put(userId, knowledgeBase.forUser(userId)));

        System.out.println("Loaded " + knowledgeBase.movies().size() + " movie facts and " + results.size()
            + " user profiles from the CSV catalogs.");
        System.out.println("The recommendation rules already ran for every user: " + results.keySet());
        printHelp();
        commandLoop(scanner, results);
    }

    private static void commandLoop(Scanner scanner, Map<String, RecommendationResult> results) {
        while (true) {
            System.out.print("> ");
            if (!scanner.hasNextLine()) {
                return;
            }

            // Piped input on Windows may start with a byte-order mark.
            String command = scanner.nextLine().replace("﻿", "").trim();
            if (command.isEmpty()) {
                continue;
            }
            String name = command.split("\\s+", 2)[0];
            String argument = command.substring(name.length()).trim();

            switch (name) {
                case "exit", "quit" -> {
                    return;
                }
                case "help" -> printHelp();
                case "users" -> System.out.println("Users: " + results.keySet());
                case "facts", "movies" -> printFacts(knowledgeBase(results));
                case "recommend" -> withUser(results, argument, false, (result, ignored) ->
                    printRecommendations(result.recommendations()));
                case "trace" -> withUser(results, argument, false, (result, movie) ->
                    printTrace(movie.isEmpty() ? result.traceEvents() : result.traceFor(movie)));
                case "how" -> withUser(results, argument, true, MovieRecommendationConsole::explainHow);
                case "why-not" -> withUser(results, argument, true, MovieRecommendationConsole::explainWhyNot);
                case "why" -> System.out.println(
                    "'why' is not available. Use how <user> <movie> for the inference path.");
                default -> System.out.println("Unknown command. Type help to see the available commands.");
            }
        }
    }

    private static KnowledgeBaseResult knowledgeBase(Map<String, RecommendationResult> results) {
        return results.values().iterator().next().knowledgeBase();
    }

    private interface UserCommand {
        void run(RecommendationResult result, String movie);
    }

    /** Runs a command whose argument is "<user>" or "<user> <movie>". */
    private static void withUser(Map<String, RecommendationResult> results, String argument, boolean movieRequired, UserCommand command) {
        String[] parts = argument.split("\\s+", 2);
        String userId = parts[0];
        String movie = parts.length > 1 ? parts[1].trim() : "";
        if (userId.isEmpty()) {
            System.out.println("Indicate the user, e.g. ana. Users: " + results.keySet());
        } else if (!results.containsKey(userId)) {
            unknownUser(userId, results);
        } else if (movieRequired && movie.isEmpty()) {
            System.out.println("Indicate the movie too, e.g. " + userId + " Batman Begins");
        } else {
            command.run(results.get(userId), movie);
        }
    }

    private static void unknownUser(String userId, Map<String, RecommendationResult> results) {
        System.out.println("The user '" + userId + "' is not in the knowledge base. Users: " + results.keySet());
    }

    private static void printHelp() {
        System.out.println();
        System.out.println("Recommendation commands (already inferred for every user)");
        System.out.println("- users                       list the users of the knowledge base");
        System.out.println("- recommend <user>            show the inferred recommendations");
        System.out.println("- how <user> <movie>          explain how a movie was recommended");
        System.out.println("- why-not <user> <movie>      explain why a movie was not recommended");
        System.out.println("- trace <user> [movie]        show the fired rule trace");
        System.out.println("- facts                       list the movie facts");
        System.out.println("- exit                        close the console");
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
                System.out.println("That movie was not recommended. Use why-not <user> " + query + " for the rejection path.");
            }
        );
    }

    private static void explainWhyNot(RecommendationResult result, String query) {
        result.findMovie(query).ifPresentOrElse(
            movie -> {
                if (result.findRecommendation(movie.id()).isPresent()) {
                    System.out.println(movie.title() + " was recommended. Use how <user> " + movie.title() + " to inspect it.");
                    return;
                }

                // A movie is only left out when an exclusion rule fired ("Excluded movie").
                System.out.println();
                System.out.println("Why-not explanation for " + movie.title());
                System.out.println("The movie was excluded because these rules fired:");
                result.exclusions(movie).forEach(reason ->
                    System.out.println("- " + reason.rule() + ": " + reason.label()));
            },
            () -> System.out.println("Unknown movie. Use facts to see the available movies.")
        );
    }

    private static void printFacts(KnowledgeBaseResult knowledgeBase) {
        System.out.println();
        System.out.println("Movie facts (CSV data and the profile inferred by movies.drl)");
        for (Movie movie : knowledgeBase.movies()) {
            System.out.printf(
                "- %s (%s, %s) | genres=%s | languages=%s | directors=%s | stars=%s | rating=%s | mpa=%s"
                    + " | pace=%s | complexity=%s | audience=%s%n",
                movie.title(),
                movie.id(),
                movie.year(),
                movie.genres(),
                movie.languages(),
                movie.directors(),
                movie.stars(),
                movie.ratingText(),
                movie.ratingMpa(),
                knowledgeBase.feature(movie.id(), Attribute.PACE).orElse("?"),
                knowledgeBase.feature(movie.id(), Attribute.COMPLEXITY).orElse("?"),
                knowledgeBase.feature(movie.id(), Attribute.AUDIENCE).orElse("?")
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
}
