import { useState } from "react";
import * as usersApi from "../api/users";
import type { User } from "../types/User";

// Os utilizadores da knowledge base e o utilizador escolhido. As ações de escrita
// devolvem uma mensagem de erro, ou null se correram bem. `onWritten` corre depois de
// cada escrita bem-sucedida (para os motores releram os utilizadores).
export function useUsers(onWritten: () => void) {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>();

    // A knowledge base é a fonte de verdade: depois de cada escrita voltamos a lê-la.
    const refresh = async (selectId?: string) => {
        const loaded = await usersApi.getUsers();
        setUsers(loaded);
        setCurrentUserId((current) => selectId ?? (loaded.some((u) => u.user_id === current) ? current : loaded[0]?.user_id));
    };

    const save = async (write: () => Promise<void>, selectId?: string) => {
        try {
            await write();
            onWritten();
            await refresh(selectId);
            return null;
        } catch (err) {
            return (err as Error).message;
        }
    };

    const createUser = async (user: User) => {
        const userId = user.user_id.trim();
        if (!userId) return "O nome é obrigatório";
        if (users.some((item) => item.user_id === userId)) return "Esse nome já está a ser usado. Escolhe outro.";
        return save(() => usersApi.createUser({ ...user, user_id: userId }), userId);
    };

    const updateUser = async (previousId: string, user: User) => {
        const userId = user.user_id.trim();
        if (!userId) return "O nome é obrigatório";
        if (users.some((item) => item.user_id === userId && item.user_id !== previousId)) return "Esse nome já está a ser usado. Escolhe outro.";
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

    return {
        users,
        currentUser,
        setCurrentUser: (user: User) => setCurrentUserId(user.user_id),
        refresh,
        createUser,
        updateUser,
        deleteUser,
    };
}
