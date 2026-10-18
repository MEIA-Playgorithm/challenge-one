package meia.playgorithm.api.controller;

import com.sun.net.httpserver.HttpExchange;
import java.util.Map;
import java.io.IOException;
import static meia.playgorithm.api.http.Http.*;
import static meia.playgorithm.api.view.JsonViews.*;

public final class HealthController {

    public static void health(HttpExchange exchange) throws IOException {
        json(exchange, 200, Map.of("status", "ok"));
    }
}
