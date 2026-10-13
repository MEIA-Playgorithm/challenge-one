import { useEffect, useState } from "react";
import { getUserRecommendations } from "../api/recommendations";
import type { EngineId } from "../lib/config";
import type { Recommendation } from "../types/Recommendation";
import type { User } from "../types/User";

type Reload = { reloading: boolean; version: number };

// Volta a pedir quando muda o motor, o utilizador ou o reload deste motor. Enquanto o
// motor recarrega não pede nada (os dados ainda seriam os antigos). Cada motor tem o
// seu próprio estado, por isso um erro ou uma demora num não afeta o outro.
export function useRecommendations(engine: EngineId, user: User, reload: Reload) {
    const [items, setItems] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setItems([]);
        setError(null);
        setLoading(true);
        if (reload.reloading) return;

        const controller = new AbortController();
        getUserRecommendations(engine, user.user_id, controller.signal)
            .then(setItems)
            .catch((err: Error) => {
                if (err.name === "AbortError") return;
                setError(err.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [engine, user, reload.reloading, reload.version]);

    return { items, loading, error };
}
