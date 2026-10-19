package meia.playgorithm.service;

import java.util.List;

/** Paginação de listas em memória. */
final class Pages {

    private Pages() {
    }

    static <T> List<T> slice(List<T> values, int offset, int limit) {
        if (offset >= values.size()) {
            return List.of();
        }
        return values.subList(offset, Math.min(values.size(), offset + limit));
    }
}
