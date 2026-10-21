import { useState } from "react";
import { reloadUsers } from "../api/recommendations";
import { config, type EngineId } from "../lib/config";

// Estado do último reload de um motor. `version` muda a cada reload concluído.
export type EngineStatus = { reloading: boolean; error: string | null; version: number };

// Os motores mostrados e o estado de cada um.
export function useEngines() {
    // Lido aqui e não ao carregar o módulo: a configuração só existe depois de loadConfig().
    const engineIds = Object.keys(config.engines) as EngineId[];
    const [engines, setSelectedEngines] = useState<EngineId[]>([]);
    const [engineStatus, setEngineStatus] = useState(
        () => Object.fromEntries(engineIds.map((id) => [id, { reloading: false, error: null, version: 0 }])) as Record<EngineId, EngineStatus>
    );

    // Mantém a ordem da configuração, seja qual for a ordem em que se escolhe.
    const setEngines = (selected: EngineId[]) => setSelectedEngines(engineIds.filter((id) => selected.includes(id)));

    // Cada motor recarrega por si: não se espera por nenhum e um erro fica só no seu motor.
    const reloadEngines = () => {
        const update = (id: EngineId, change: (status: EngineStatus) => EngineStatus) =>
            setEngineStatus((current) => ({ ...current, [id]: change(current[id]) }));
        for (const id of engineIds) {
            update(id, (status) => ({ ...status, reloading: true }));
            reloadUsers(id)
                .then(() => null)
                .catch((err: Error) => `Reload failed: ${err.message}`)
                .then((error) => update(id, (status) => ({ reloading: false, error, version: status.version + 1 })));
        }
    };

    return { engines, setEngines, engineStatus, reloadEngines };
}
