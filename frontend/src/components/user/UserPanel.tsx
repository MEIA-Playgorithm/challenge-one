import { useState } from "react";
import { Box, Paper } from "@mui/material";
import { useApp } from "../../context/AppContext";
import type { User } from "../../types/User";
import UserList from "./UserList";
import UserSummary from "./UserSummary";
import UserForm from "./UserForm";
import DeleteUserDialog from "./DeleteUserDialog";

type Mode = "view" | "edit" | "create";

const UserPanel = () => {
    const { users, currentUser, setCurrentUser } = useApp();
    const [mode, setMode] = useState<Mode>("view");
    // O utilizador a apagar; o diálogo guarda-o enquanto fecha.
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const selectUser = (user: User) => {
        setCurrentUser(user);
        setMode("view");
    };

    return (
        <Paper sx={{ flex: "0 0 auto", overflow: "visible" }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <UserList
                    users={users}
                    selectedId={mode === "create" ? null : currentUser.user_id}
                    creating={mode === "create"}
                    onSelect={selectUser}
                    onNew={() => setMode("create")}
                />
            </Box>

            <Box sx={{ p: 3 }}>
                {mode === "view" ? (
                    <UserSummary
                        user={currentUser}
                        canDelete={users.length > 1}
                        onEdit={() => setMode("edit")}
                        onDelete={() => {
                            setDeleteId(currentUser.user_id);
                            setDeleteOpen(true);
                        }}
                    />
                ) : (
                    <UserForm mode={mode} onClose={() => setMode("view")} />
                )}
            </Box>

            <DeleteUserDialog open={deleteOpen} userId={deleteId} onClose={() => setDeleteOpen(false)} />
        </Paper>
    );
};

export default UserPanel;
