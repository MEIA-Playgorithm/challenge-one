import type { EngineId } from "../lib/config";

// As rotas de cada microserviço, escritas por extenso. O URL base de cada um vem de /config.json.

type EngineRoutes = {
    userRecommendations: (userId: string, limit: number) => string;
    reloadUsers: string;
};

export const knowledgeBaseRoutes = {
    usersCsv: "/users.csv",
    moviesCsv: "/movies.csv",
    users: "/users",
    user: (userId: string) => `/users/${encodeURIComponent(userId)}`,
};

const prologRoutes: EngineRoutes = {
    userRecommendations: (userId, limit) => `/api/recomendacoes_utilizador?user_id=${encodeURIComponent(userId)}&limit=${limit}`,
    reloadUsers: "/api/reload/users",
};

const droolsRoutes: EngineRoutes = {
    userRecommendations: (userId, limit) => `/api/recomendacoes_utilizador?user_id=${encodeURIComponent(userId)}&limit=${limit}`,
    reloadUsers: "/api/reload/users",
};

// Só o motor Prolog tem o diálogo (swi-prolog/rules_dialog.pl).
export const prologDialogueRoute = "/api/dialogo";

export const engineRoutes: Record<EngineId, EngineRoutes> = {
    prolog: prologRoutes,
    drools: droolsRoutes,
};
