import { useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useApp } from "../context/AppContext";
import { emptyUser, type User } from "../types/User";
import { avatarColor, initials } from "../lib/utils";

type Mode = "view" | "edit" | "create";

const UserPanel = () => {
    const { users, currentUser, setCurrentUser, createUser, updateUser, deleteUser } = useApp();
    const [mode, setMode] = useState<Mode>("view");
    const [form, setForm] = useState({ user_id: "", age: 0 });
    const [error, setError] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const selectUser = (user: User) => {
        setCurrentUser(user);
        setMode("view");
        setError(null);
    };

    const cancel = () => {
        setError(null);
        setMode("view");
    };

    const save = () => {
        const message =
            mode === "create"
                ? createUser(emptyUser(form.user_id, form.age))
                : updateUser(currentUser.user_id, { ...currentUser, ...form } as User);
        if (message) {
            setError(message);
            return;
        }
        setError(null);
        setMode("view");
    };

    const editing = mode === "edit" || mode === "create";

    return (
        <Paper sx={{ flex: "0 0 auto", overflow: "visible" }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>
                    {users.map((user) => {
                        const selected = mode !== "create" && user.user_id === currentUser.user_id;
                        return (
                            <Chip
                                key={user.user_id}
                                avatar={
                                    <Avatar sx={{ bgcolor: avatarColor(user.user_id), fontSize: 12, color: "white !important" }}>
                                        {initials(user.user_id)}
                                    </Avatar>
                                }
                                label={user.user_id}
                                onClick={() => selectUser(user)}
                                variant={selected ? "filled" : "outlined"}
                                color={selected ? "primary" : "default"}
                                sx={{ fontWeight: selected ? 600 : 400 }}
                            />
                        );
                    })}
                    <Tooltip title="New user">
                        <Chip
                            icon={<AddIcon />}
                            label="New"
                            onClick={() => {
                                setForm({ user_id: "", age: 0 });
                                setError(null);
                                setMode("create");
                            }}
                            variant={mode === "create" ? "filled" : "outlined"}
                            color={mode === "create" ? "secondary" : "default"}
                        />
                    </Tooltip>
                </Stack>
            </Box>

            <Box sx={{ p: 3 }}>
                {!editing ? (
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                        <Avatar
                            sx={{
                                width: 64,
                                height: 64,
                                bgcolor: avatarColor(currentUser.user_id),
                                fontSize: 22,
                                fontWeight: 600,
                            }}
                        >
                            {initials(currentUser.user_id)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                {currentUser.user_id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Age {currentUser.age}
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                setForm({ user_id: currentUser.user_id, age: currentUser.age });
                                setError(null);
                                setMode("edit");
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            disabled={users.length < 2}
                            onClick={() => {
                                setConfirmDelete(currentUser.user_id);
                                setConfirmOpen(true);
                            }}
                        >
                            Delete
                        </Button>
                    </Stack>
                ) : (
                    <Stack spacing={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {mode === "create" ? "New User" : "Edit User"}
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Name"
                                value={form.user_id}
                                onChange={(event) => setForm((current) => ({ ...current, user_id: event.target.value }))}
                                size="small"
                                fullWidth
                                autoFocus
                            />
                            <TextField
                                label="Age"
                                type="number"
                                value={form.age || ""}
                                onChange={(event) => setForm((current) => ({ ...current, age: Number(event.target.value) }))}
                                size="small"
                                sx={{ width: 120 }}
                            />
                        </Stack>
                        {error && (
                            <Typography variant="body2" color="error">
                                {error}
                            </Typography>
                        )}
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<CheckIcon />}
                                onClick={save}
                                disabled={!form.user_id.trim() || form.age <= 0}
                            >
                                Save
                            </Button>
                            <Button variant="text" size="small" startIcon={<CloseIcon />} onClick={cancel} color="inherit">
                                Cancel
                            </Button>
                        </Stack>
                    </Stack>
                )}
            </Box>
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Delete {confirmDelete}?</DialogTitle>
                <DialogContent>
                    <DialogContentText>This removes {confirmDelete} from the list.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        onClick={() => {
                            if (confirmDelete) deleteUser(confirmDelete);
                            setConfirmOpen(false);
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default UserPanel;
