package meia.playgorithm.api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.Map;
import java.util.concurrent.Executors;
import meia.playgorithm.api.controller.*;
import meia.playgorithm.api.http.ApiException;
import static meia.playgorithm.api.http.Http.*;

public final class ApiServer {

    public static void start(int port) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/", ApiServer::route);
        server.setExecutor(Executors.newFixedThreadPool(8));
        server.start();

        System.out.println("Playgorithm Drools API running on http://localhost:" + port);
        System.out.println("Swagger docs available at http://localhost:" + port + "/docs");
    }

    private static void route(HttpExchange exchange) throws IOException {
        long start = System.currentTimeMillis();
        try {
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();
            Map<String, String> query = query(exchange);

            if ("OPTIONS".equals(method)) {
                json(exchange, 200, Map.of("status", "ok"));
            } else if ("GET".equals(method) && ("/api/health".equals(path) || "/health".equals(path))) {
                HealthController.health(exchange);
            } else if ("GET".equals(method) && ("/api/filmes".equals(path) || "/api/facts".equals(path) || "/movies".equals(path) || "/facts".equals(path))) {
                MovieController.movies(exchange, query);
            } else if ("GET".equals(method) && "/api/filme".equals(path)) {
                MovieController.movie(exchange, query);
            } else if ("GET".equals(method) && "/api/recomendacoes".equals(path)) {
                MovieController.similarRecommendations(exchange, query);
            } else if ("GET".equals(method) && "/api/recomendacoes_utilizador".equals(path)) {
                UserRecommendationController.userRecommendations(exchange, query);
            } else if ("GET".equals(method) && "/api/how".equals(path)) {
                ExplanationController.how(exchange, query);
            } else if ("GET".equals(method) && ("/api/why-not".equals(path) || "/api/why_not".equals(path))) {
                ExplanationController.whyNot(exchange, query);
            } else if ("GET".equals(method) && "/api/trace".equals(path)) {
                ExplanationController.trace(exchange, query);
            } else if ("POST".equals(method) && path.matches("/api/reload(/users|/movies)?")) {
                ReloadController.reload(exchange, path.substring("/api/reload".length()));
            } else if ("POST".equals(method) && "/recommendations".equals(path)) {
                DebugController.recommendations(exchange);
            } else if ("POST".equals(method) && "/how".equals(path)) {
                DebugController.how(exchange);
            } else if ("POST".equals(method) && "/why-not".equals(path)) {
                DebugController.whyNot(exchange);
            } else if ("POST".equals(method) && "/trace".equals(path)) {
                DebugController.trace(exchange);
            } else if ("GET".equals(method) && "/openapi.json".equals(path)) {
                json(exchange, 200, DocsController.openApi());
            } else if ("GET".equals(method) && "/docs".equals(path)) {
                html(exchange, DocsController.swaggerUi());
            } else if (path.startsWith("/api/")) {
                json(exchange, 405, Map.of("error", "method_not_allowed"));
            } else {
                json(exchange, 404, Map.of("error", "Route not found"));
            }
        } catch (ApiException exception) {
            json(exchange, exception.status(), Map.of("error", exception.getMessage()));
        } catch (IllegalArgumentException exception) {
            json(exchange, 400, Map.of("error", exception.getMessage()));
        } catch (Exception exception) {
            json(exchange, 500, Map.of("error", "internal_server_error", "detail", exception.getMessage()));
        } finally {
            // Uma linha por pedido em stderr, que o Docker mostra em `docker compose logs`.
            System.err.printf("%s %s -> %d (%d ms)%n", exchange.getRequestMethod(), exchange.getRequestURI(),
                exchange.getResponseCode(), System.currentTimeMillis() - start);
            exchange.close();
        }
    }
}
