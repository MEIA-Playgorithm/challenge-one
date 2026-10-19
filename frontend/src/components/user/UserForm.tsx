import { useState } from "react";
import { Button, Stack, TextField, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "sonner";
import { useApp } from "../../context/AppContext";
import { emptyUser, type User } from "../../types/User";

type Props = {
    mode: "create" | "edit";
    onClose: () => void;
};

// Criar um utilizador novo, ou editar o nome e a idade do atual.
const UserForm = ({ mode, onClose }: Props) => {
    const { currentUser, createUser, updateUser } = useApp();
    const [form, setForm] = useState(mode === "edit" ? { user_id: currentUser.user_id, age: currentUser.age } : { user_id: "", age: 0 });
    const [saving, setSaving] = useState(false);

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
        onClose();
        toast.success(mode === "create" ? "User created" : "User saved");
    };

    return (
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
                <Button type="submit" variant="contained" size="small" startIcon={<CheckIcon />} disabled={saving || !canSave}>
                    Save
                </Button>
                <Button type="button" variant="text" size="small" startIcon={<CloseIcon />} onClick={onClose} color="inherit">
                    Cancel
                </Button>
            </Stack>
        </Stack>
    );
};

export default UserForm;
