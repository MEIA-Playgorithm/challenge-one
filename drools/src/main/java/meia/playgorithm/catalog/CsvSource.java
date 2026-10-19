package meia.playgorithm.catalog;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/** Lê as linhas de um CSV a partir de um URL (http://...) ou de um ficheiro local. */
final class CsvSource {

    private static final HttpClient CLIENT = HttpClient.newHttpClient();

    private CsvSource() {
    }

    /** A origem em `envName` (URL ou caminho); se não estiver definida, o primeiro ficheiro local que existir. */
    static String find(String envName, List<Path> candidates) {
        String configured = System.getenv(envName);
        if (configured != null && !configured.isBlank()) {
            return configured;
        }
        return candidates.stream()
            .filter(Files::isRegularFile)
            .findFirst()
            .map(Path::toString)
            .orElseThrow(() -> new IllegalStateException(
                "Set " + envName + " or run from a folder that contains " + candidates.get(0)
            ));
    }

    static List<String> readLines(String source) throws IOException {
        if (!source.startsWith("http://") && !source.startsWith("https://")) {
            return Files.readAllLines(Path.of(source));
        }
        try {
            HttpResponse<String> response = CLIENT.send(
                HttpRequest.newBuilder(URI.create(source)).build(),
                HttpResponse.BodyHandlers.ofString()
            );
            if (response.statusCode() != 200) {
                throw new IOException("HTTP " + response.statusCode() + " from " + source);
            }
            return response.body().lines().toList();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IOException("Interrupted while reading " + source, exception);
        }
    }
}
