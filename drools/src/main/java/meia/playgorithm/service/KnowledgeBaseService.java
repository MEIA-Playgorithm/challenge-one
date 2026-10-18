package meia.playgorithm.service;

import meia.playgorithm.api.dto.ReloadDto;
import meia.playgorithm.catalog.MovieCatalog;
import meia.playgorithm.catalog.UserCatalog;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** A base de conhecimento (os CSV de filmes e de utilizadores): recarregamento. */
@Service
public class KnowledgeBaseService {

    private final MovieCatalog movies;
    private final UserCatalog users;

    public KnowledgeBaseService(MovieCatalog movies, UserCatalog users) {
        this.movies = movies;
        this.users = users;
    }

    /** `scope` é all, users ou movies. Se um CSV for inválido, os dados anteriores mantêm-se. */
    public ReloadDto reload(String scope) {
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
        return new ReloadDto("ok", scope, movies.movies().size(), users.users().size());
    }
}
