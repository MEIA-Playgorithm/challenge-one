package meia.playgorithm;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import meia.playgorithm.console.MovieRecommendationConsole;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Ponto de entrada: sem argumentos arranca a API REST; com `console`, a consola interativa. */
@SpringBootApplication
@OpenAPIDefinition(info = @Info(title = "Playgorithm Drools Recommendation API", version = "1.0.0"))
public class Application {

    public static void main(String[] args) {
        if (args.length > 0 && args[0].equals("console")) {
            MovieRecommendationConsole.main(args);
        } else {
            SpringApplication.run(Application.class, args);
        }
    }
}
