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
import { toast } from "sonner";

type Mode = "view" | "edit" | "create";

const UserPanel = () => {
    const { users, currentUser, setCurrentUser, createUser, updateUser, deleteUser } = useApp();
    const [mode, setMode] = useState<Mode>("view");
    const [form, setForm] = useState({ user_id: "", age: 0 });
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const selectUser = (user: User) => {
        setCurrentUser(user);
        setMode("view");
    };

    const cancel = () => {
        setMode("view");
    };

    const canSave = form.user_id.trim() !== "";

    const save = async () => {
        if (!canSave || saving) return;
        if (mode === "edit" && form.user_id.trim() === currentUser.user_id && form.age === currentUser.age) {
            toast("No changes to save");
            return;
        }

        setSaving(true);
        const message =
            mode === "create"
                ? await createUser(emptyUser(form.user_id, form.age))
                : await updateUser(currentUser.user_id, { ...currentUser, ...form } as User);
        setSaving(false);
        if (message) {
            toast.error(message);
            return;
        }
        setMode("view");
        toast.success(mode === "create" ? "User created" : "User saved");
    };

    const editing = mode === "edit" || mode === "create";

    return (
        <Paper sx={{ flex: "0 0 auto", overflow: "visible" }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>
                    {users.slice().sort((a, b) => a.user_id.toLowerCase().localeCompare(b.user_id.toLowerCase())).map((user) => {
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
                                setMode("create");
                            }}
                            variant={mode === "create" ? "filled" : "outlined"}
                            color={mode === "create" ? "primary" : "default"}
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
                                {currentUser.age ? `Age ${currentUser.age}` : "No age set"}
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                setForm({ user_id: currentUser.user_id, age: currentUser.age });
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
                    <Stack
                        component="form"
                        spacing={2}
                        onSubmit={(event) => {
                            event.preventDefault();
                            save();
                        }}
                    >
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
                        <Stack direction="row" spacing={1}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="small"
                                startIcon={<CheckIcon />}
                                disabled={saving || !canSave}
                            >
                                Save
                            </Button>
                            <Button type="button" variant="text" size="small" startIcon={<CloseIcon />} onClick={cancel} color="inherit">
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
                        disabled={saving}
                        onClick={async () => {
                            if (!confirmDelete) return;
                            setSaving(true);
                            const message = await deleteUser(confirmDelete);
                            setSaving(false);
                            if (message) return toast.error(message);
                            toast.success(`Deleted ${confirmDelete}`);
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
