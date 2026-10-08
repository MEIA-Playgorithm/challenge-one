import { createContext, useContext, useState, ReactNode } from "react";
import type { User } from "../types/User";
import { MOCK_USERS } from "../mocks/data";

type AppContextType = {
    users: User[];
    currentUser: User;
    setCurrentUser: (user: User) => void;
    createUser: (user: User) => string | null;
    updateUser: (previousId: string, user: User) => string | null;
    deleteUser: (userId: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);

    const createUser = (user: User) => {
        const userId = user.user_id.trim();
        if (!userId) return "Name is required";
        if (users.some((item) => item.user_id === userId)) return "Name already exists";
        const saved = { ...user, user_id: userId };
        setUsers((prev) => [...prev, saved]);
        setCurrentUser(saved);
        return null;
    };

    const updateUser = (previousId: string, user: User) => {
        const userId = user.user_id.trim();
        if (!userId) return "Name is required";
        if (users.some((item) => item.user_id === userId && item.user_id !== previousId)) return "Name already exists";
        const saved = { ...user, user_id: userId };
        setUsers((prev) => prev.map((item) => (item.user_id === previousId ? saved : item)));
        setCurrentUser(saved);
        return null;
    };

    const deleteUser = (userId: string) => {
        if (users.length <= 1) return;
        const index = users.findIndex((user) => user.user_id === userId);
        if (index === -1) return;
        const remaining = users.filter((user) => user.user_id !== userId);
        setUsers(remaining);
        setCurrentUser((current) => (current.user_id === userId ? remaining[Math.min(index, remaining.length - 1)] : current));
    };

    return (
        <AppContext.Provider value={{ users, currentUser, setCurrentUser, createUser, updateUser, deleteUser }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp(): AppContextType {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp must be used inside AppProvider");
    return ctx;
}
