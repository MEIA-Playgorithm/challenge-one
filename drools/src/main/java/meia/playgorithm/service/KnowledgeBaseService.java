package meia.playgorithm.service;

import meia.playgorithm.api.dto.ReloadDto;
import meia.playgorithm.catalog.MovieCatalog;
import meia.playgorithm.catalog.UserCatalog;
import meia.playgorithm.engine.DroolsRecommendationService;
import meia.playgorithm.engine.KnowledgeBaseResult;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** A base de conhecimento (os CSV de filmes e de utilizadores) e os factos que o motor infere sobre ela. */
@Service
public class KnowledgeBaseService {

    private final MovieCatalog movies;
    private final UserCatalog users;
    private final DroolsRecommendationService engine;

    // O motor corre uma vez para todos os filmes e utilizadores; volta a correr depois de um reload.
    private KnowledgeBaseResult current;

    public KnowledgeBaseService(MovieCatalog movies, UserCatalog users, DroolsRecommendationService engine) {
        this.movies = movies;
        this.users = users;
        this.engine = engine;
    }

    public synchronized KnowledgeBaseResult current() {
        if (current == null) {
            current = engine.run(movies.movies(), users.users());
        }
        return current;
    }

    /** `scope` é all, users ou movies. Se um CSV for inválido, os dados anteriores mantêm-se. */
    public synchronized ReloadDto reload(String scope) {
        try {
            if (!scope.equals("users")) {
                movies.reload();
            }
            if (!scope.equals("movies")) {
                users.reload();
            }
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, exception.getMessage(), exception);
        }
        current = null;
        return new ReloadDto("ok", scope, movies.movies().size(), users.users().size());
    }
}
