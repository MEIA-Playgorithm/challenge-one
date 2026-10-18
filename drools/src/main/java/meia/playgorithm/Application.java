package meia.playgorithm;

import meia.playgorithm.api.ApiServer;
import meia.playgorithm.console.MovieRecommendationConsole;

import java.io.IOException;

/** Ponto de entrada: sem argumentos arranca a API REST; com `console`, a consola interativa. */
public final class Application {

    private Application() {
    }

    public static void main(String[] args) throws IOException {
        if (args.length > 0 && args[0].equals("console")) {
            MovieRecommendationConsole.main(args);
        } else {
            ApiServer.start(Integer.parseInt(System.getenv().getOrDefault("PORT", "8080")));
        }
    }
}
