import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User } from "../types/User";
import type { PreferenceStatus } from "../types/Movie";
import { MOCK_USERS } from "../mocks/data";
import { createUser, listUsers, patchUser, routeUnavailable } from "../api/users";

type AppContextType = {
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  addUser: (user: User) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  movieStatuses: Record<string, PreferenceStatus>;
  setMovieStatus: (movieId: string, status: PreferenceStatus | null) => void;
  creditStatuses: Record<string, PreferenceStatus>;
  setCreditStatus: (id: string, status: PreferenceStatus | null) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [movieStatusesByUser, setMovieStatusesByUser] = useState<
    Record<string, Record<string, PreferenceStatus>>
  >({});
  const [creditStatusesByUser, setCreditStatusesByUser] = useState<
    Record<string, Record<string, PreferenceStatus>>
  >({});

  useEffect(() => {
    const controller = new AbortController();
    listUsers(controller.signal)
      .then((items) => {
        if (controller.signal.aborted || !items || items.length === 0) return;
        setUsers(items);
        setCurrentUser((current) => items.find((user) => user.user_id === current.user_id) ?? items[0]);
      })
      .catch((error: unknown) => {
        if (isAbort(error)) return;
      });
    return () => controller.abort();
  }, []);

  const addUser = async (user: User) => {
    try {
      const created = await createUser(user);
      setUsers((prev) => [...prev, created]);
      setCurrentUser(created);
    } catch (error) {
      if (!routeUnavailable(error)) throw error;
      setUsers((prev) => [...prev, user]);
      setCurrentUser(user);
    }
  };

  const updateUser = async (updated: User) => {
    try {
      const saved = await patchUser(updated);
      setUsers((prev) => prev.map((user) => (user.user_id === saved.user_id ? saved : user)));
      setCurrentUser(saved);
    } catch (error) {
      if (!routeUnavailable(error)) throw error;
      setUsers((prev) => prev.map((user) => (user.user_id === updated.user_id ? updated : user)));
      setCurrentUser(updated);
    }
  };

  const movieStatuses = movieStatusesByUser[currentUser.user_id] ?? {};
  const setMovieStatus = (movieId: string, status: PreferenceStatus | null) => {
    setMovieStatusesByUser((prev) => {
      const userMap = { ...(prev[currentUser.user_id] ?? {}) };
      if (status === null) delete userMap[movieId];
      else userMap[movieId] = status;
      return { ...prev, [currentUser.user_id]: userMap };
    });
  };

  const creditStatuses = creditStatusesByUser[currentUser.user_id] ?? {};
  const setCreditStatus = (id: string, status: PreferenceStatus | null) => {
    setCreditStatusesByUser((prev) => {
      const userMap = { ...(prev[currentUser.user_id] ?? {}) };
      if (status === null) delete userMap[id];
      else userMap[id] = status;
      return { ...prev, [currentUser.user_id]: userMap };
    });
  };

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        setCurrentUser,
        addUser,
        updateUser,
        movieStatuses,
        setMovieStatus,
        creditStatuses,
        setCreditStatus,
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
