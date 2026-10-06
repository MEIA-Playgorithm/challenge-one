import { createContext, useContext, useState, ReactNode } from "react";
import type { User } from "../types/User";
import { emptyUserFields } from "../types/User";
import type { PreferenceStatus } from "../types/Movie";
import { MOCK_USERS } from "../mocks/data";

type AppContextType = {
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  addUser: (user: Omit<User, "id">) => void;
  updateUser: (user: User) => void;
  movieStatuses: Record<string, PreferenceStatus>;
  setMovieStatus: (movieId: string, status: PreferenceStatus | null) => void;
  creditStatuses: Record<string, PreferenceStatus>;
  setCreditStatus: (id: string, status: PreferenceStatus | null) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [movieStatusesByUser, setMovieStatusesByUser] = useState<
    Record<number, Record<string, PreferenceStatus>>
  >({});
  const [creditStatusesByUser, setCreditStatusesByUser] = useState<
    Record<number, Record<string, PreferenceStatus>>
  >({});

  const addUser = (data: Omit<User, "id">) => {
    const newUser: User = { id: Date.now(), ...emptyUserFields(), ...data };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
  };

  const updateUser = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setCurrentUser(updated);
  };

  const movieStatuses = movieStatusesByUser[currentUser.id] ?? {};
  const setMovieStatus = (movieId: string, status: PreferenceStatus | null) => {
    setMovieStatusesByUser((prev) => {
      const userMap = { ...(prev[currentUser.id] ?? {}) };
      if (status === null) delete userMap[movieId];
      else userMap[movieId] = status;
      return { ...prev, [currentUser.id]: userMap };
    });
  };

  const creditStatuses = creditStatusesByUser[currentUser.id] ?? {};
  const setCreditStatus = (id: string, status: PreferenceStatus | null) => {
    setCreditStatusesByUser((prev) => {
      const userMap = { ...(prev[currentUser.id] ?? {}) };
      if (status === null) delete userMap[id];
      else userMap[id] = status;
      return { ...prev, [currentUser.id]: userMap };
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
