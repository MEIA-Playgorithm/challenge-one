import { config, type EngineId } from "../lib/config";
import { imdbRating } from "../lib/movies";
import type { Recommendation } from "../types/Recommendation";
import { request } from "./request";
import { engineRoutes } from "./routes";

// Todos os motores expõem o mesmo contrato HTTP; só muda o URL base.
export async function getUserRecommendations(engine: EngineId, userId: string, signal?: AbortSignal) {
    const path = engineRoutes[engine].userRecommendations(userId, 20);
    const response = await request(config.engines[engine], path, { signal });
    const data = await response.json();
    return (data.items as Recommendation[]).map((item) => ({
        ...item,
        movie: { ...item.movie, rating_imdb: imdbRating(item.movie.rating_imdb) },
    }));
}

// Pede a um motor que releia os utilizadores da knowledge base.
export async function reloadUsers(engine: EngineId) {
    await request(config.engines[engine], engineRoutes[engine].reloadUsers, { method: "POST" });
}
