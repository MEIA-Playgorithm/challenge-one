import { config, type EngineId } from "../lib/config";
import type { Recommendation } from "../types/Recommendation";
import { request } from "./request";

// Todos os motores expõem o mesmo contrato HTTP; só muda o URL base.
export async function getUserRecommendations(engine: EngineId, userId: string, signal?: AbortSignal) {
    const path = `/api/recomendacoes_utilizador?user_id=${encodeURIComponent(userId)}&limit=20`;
    const response = await request(config.engines[engine], path, { signal });
    const data = await response.json();
    return data.items as Recommendation[];
}

// Pede a um motor que releia os utilizadores da knowledge base.
export async function reloadUsers(engine: EngineId) {
    await request(config.engines[engine], "/api/reload/users", { method: "POST" });
}
