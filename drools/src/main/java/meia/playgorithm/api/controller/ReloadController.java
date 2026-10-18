package meia.playgorithm.api.controller;

import meia.playgorithm.api.http.ApiException;
import meia.playgorithm.catalog.MovieCatalog;
import meia.playgorithm.catalog.UserCatalog;
import com.sun.net.httpserver.HttpExchange;
import java.util.Map;
import java.io.IOException;
import static meia.playgorithm.api.http.Http.*;
import static meia.playgorithm.api.view.JsonViews.*;

public final class ReloadController {

    public static void reload(HttpExchange exchange, String scope) throws IOException {
        String reloaded = scope.isEmpty() ? "all" : scope.substring(1);
        try {
            if (!reloaded.equals("users")) {
                MovieCatalog.reload();
            }
            if (!reloaded.equals("movies")) {
                UserCatalog.reload();
            }
        } catch (IllegalStateException exception) {
            throw new ApiException(422, exception.getMessage());
        }
        json(exchange, 200, Map.of(
            "status", "ok",
            "reloaded", reloaded,
            "movies", MovieCatalog.movies().size(),
            "users", UserCatalog.users().size()
        ));
    }
}
