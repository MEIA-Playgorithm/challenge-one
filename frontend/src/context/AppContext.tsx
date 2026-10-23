import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import type { User } from "../types/User";
import type { Movie } from "../types/Movie";
import type { EngineId } from "../lib/config";
import { getMovies } from "../api/movies";
import { useEngines, type EngineStatus } from "../hooks/useEngines";
import { useUsers } from "../hooks/useUsers";

// As ações de escrita devolvem uma mensagem de erro, ou null se correram bem.
type AppContextType = {
    engines: EngineId[];
    setEngines: (engines: EngineId[]) => void;
    engineStatus: Record<EngineId, EngineStatus>;
    users: User[];
    movies: Movie[];
    movieById: Map<string, Movie>;
    currentUser: User;
    setCurrentUser: (user: User) => void;
    createUser: (user: User) => Promise<string | null>;
    updateUser: (previousId: string, user: User) => Promise<string | null>;
    deleteUser: (userId: string) => Promise<string | null>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const { engines, setEngines, engineStatus, reloadEngines } = useEngines();
    const { users, currentUser, setCurrentUser, refresh, createUser, updateUser, deleteUser } = useUsers(reloadEngines);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([refresh(), getMovies().then(setMovies)])
            .catch((err: Error) => setLoadError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading || loadError || !currentUser) {
        return (
            <Box sx={{ height: "100%", display: "grid", placeContent: "center", textAlign: "center" }}>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <Typography color="error">{loadError ?? "Não há utilizadores na base de conhecimento"}</Typography>
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
                movies,
                movieById: new Map(movies.map((movie) => [movie.id, movie])),
                currentUser,
                setCurrentUser,
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
