package meia.playgorithm.api.controller;

import meia.playgorithm.model.Recommendation;
import java.util.List;
import java.util.Map;
import static meia.playgorithm.api.http.Http.*;
import static meia.playgorithm.api.view.JsonViews.*;

public final class DocsController {

    public static Map<String, Object> openApi() {
        return Map.of(
            "openapi", "3.0.3",
            "info", Map.of("title", "Playgorithm Drools Recommendation API", "version", "1.0.0"),
            "paths", Map.ofEntries(
                Map.entry("/api/health", Map.of("get", Map.of("summary", "Check API health"))),
                Map.entry("/api/filmes", Map.of("get", Map.of("summary", "List movie facts with Prolog-compatible pagination and filters"))),
                Map.entry("/api/filme", Map.of("get", Map.of("summary", "Read one movie by id"))),
                Map.entry("/api/recomendacoes", Map.of("get", Map.of("summary", "List similar movies for a source movie"))),
                Map.entry("/api/recomendacoes_utilizador", Map.of("get", Map.of("summary", "List recommendations for a CSV user profile"))),
                Map.entry("/api/how", Map.of("get", Map.of("summary", "Explain how a recommendation was inferred"))),
                Map.entry("/api/why-not", Map.of("get", Map.of("summary", "Explain why a movie was not recommended"))),
                Map.entry("/api/why_not", Map.of("get", Map.of("summary", "Alias for /api/why-not"))),
                Map.entry("/api/trace", Map.of("get", Map.of("summary", "Return trace events")))
            )
        );
    }

    public static String swaggerUi() {
        return """
            <!doctype html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <title>Playgorithm Drools API Docs</title>
              <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
            </head>
            <body>
              <div id="swagger-ui"></div>
              <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
              <script>
                window.ui = SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger-ui' });
              </script>
            </body>
            </html>
            """;
    }
}
