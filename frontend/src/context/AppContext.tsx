import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import type { User } from "../types/User";
import { config, type EngineId } from "../lib/config";
import * as usersApi from "../api/users";
import { reloadUsers } from "../api/recommendations";

// Estado do último reload de um motor. `version` muda a cada reload concluído.
export type EngineStatus = { reloading: boolean; error: string | null; version: number };

// As ações de escrita devolvem uma mensagem de erro, ou null se correram bem.
type AppContextType = {
    engines: EngineId[];
    setEngines: (engines: EngineId[]) => void;
    engineStatus: Record<EngineId, EngineStatus>;
    users: User[];
    currentUser: User;
    setCurrentUser: (user: User) => void;
    createUser: (user: User) => Promise<string | null>;
    updateUser: (previousId: string, user: User) => Promise<string | null>;
    deleteUser: (userId: string) => Promise<string | null>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const engineIds = Object.keys(config.engines) as EngineId[];
    const [engines, setSelectedEngines] = useState<EngineId[]>([]);
    const [engineStatus, setEngineStatus] = useState(
        () => Object.fromEntries(engineIds.map((id) => [id, { reloading: false, error: null, version: 0 }])) as Record<EngineId, EngineStatus>
    );
    const [users, setUsers] = useState<User[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>();
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

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

    // A knowledge base é a fonte de verdade: depois de cada escrita voltamos a lê-la.
    const refresh = async (selectId?: string) => {
        const loaded = await usersApi.getUsers();
        setUsers(loaded);
        setCurrentUserId((current) => selectId ?? (loaded.some((u) => u.user_id === current) ? current : loaded[0]?.user_id));
    };

    useEffect(() => {
        refresh()
            .catch((err: Error) => setLoadError(err.message))
            .finally(() => setLoading(false));
    }, []);

    // Grava na knowledge base, volta a ler a lista e pede aos motores que releiam os utilizadores.
    const save = async (write: () => Promise<void>, selectId?: string) => {
        try {
            await write();
            reloadEngines();
            await refresh(selectId);
            return null;
        } catch (err) {
            return (err as Error).message;
        }
    };

    const createUser = async (user: User) => {
        const userId = user.user_id.trim();
        if (!userId) return "Name is required";
        if (users.some((item) => item.user_id === userId)) return "Please choose another name, this one is already taken.";
        return save(() => usersApi.createUser({ ...user, user_id: userId }), userId);
    };

    const updateUser = async (previousId: string, user: User) => {
        const userId = user.user_id.trim();
        if (!userId) return "Name is required";
        if (users.some((item) => item.user_id === userId && item.user_id !== previousId)) return "Please choose another name, this one is already taken.";
        return save(() => usersApi.updateUser(previousId, { ...user, user_id: userId }), userId);
    };

    const deleteUser = async (userId: string) => {
        if (users.length <= 1) return null;
        const index = users.findIndex((user) => user.user_id === userId);
        if (index === -1) return null;
        const remaining = users.filter((user) => user.user_id !== userId);
        const next = remaining[Math.min(index, remaining.length - 1)].user_id;
        return save(() => usersApi.deleteUser(userId), userId === currentUserId ? next : currentUserId);
    };

    const currentUser = users.find((user) => user.user_id === currentUserId) ?? users[0];

    if (loading || loadError || !currentUser) {
        return (
            <Box sx={{ height: "100%", display: "grid", placeContent: "center", textAlign: "center" }}>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <Typography color="error">{loadError ?? "No users found in the knowledge base"}</Typography>
                )}
            </Box>
        );
    }

    return (
        <AppContext.Provider
            value={{
                engines,
                setEngines,
                engineStatus,
                users,
                currentUser,
                setCurrentUser: (user) => setCurrentUserId(user.user_id),
                createUser,
                updateUser,
                deleteUser,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp(): AppContextType {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp must be used inside AppProvider");
    return ctx;
}
