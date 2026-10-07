import { useEffect, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
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
import { useCatalog } from "../api/useCatalog";
import type { User, UserPreferences } from "../types/User";
import { emptyUser } from "../types/User";
import { avatarColor, initials } from "../lib/utils";
import PreferenceChips from "./PreferenceChips";

const PREFER_GROUPS: { key: keyof UserPreferences; label: string }[] = [
    { key: "director", label: "Preferred directors" },
    { key: "writer", label: "Preferred writers" },
    { key: "star", label: "Preferred actors" },
    { key: "country_origin", label: "Preferred countries" },
    { key: "subgenre", label: "Preferred subgenres" },
    { key: "pace", label: "Pace" },
    { key: "complexity", label: "Complexity" },
    { key: "violence", label: "Violence" },
    { key: "humor", label: "Humor" },
    { key: "psychological_intensity", label: "Psychological intensity" },
    { key: "emotional_tone", label: "Emotional tone" },
    { key: "themes", label: "Themes" },
    { key: "audience", label: "Audience" },
    { key: "era", label: "Era" },
    { key: "popularity", label: "Popularity" },
];

function filmTitle(titles: Map<string, string>, id: string) {
    return titles.get(id) ?? id;
}

function yesNo(value: boolean) {
    return value ? "yes" : "no";
}

type Mode = "view" | "edit" | "create";

const UserPanel = () => {
    const { users, currentUser, setCurrentUser, addUser, updateUser } = useApp();
    const { movies } = useCatalog();
    const titles = new Map(movies.map((movie) => [movie.id, movie.title]));
    const limits = currentUser.limits;
    const [mode, setMode] = useState<Mode>("view");
    const [form, setForm] = useState({ user_id: "", age: 0 });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (mode === "edit") {
            setForm({ user_id: currentUser.user_id, age: currentUser.age ?? 0 });
        }
    }, [mode, currentUser]);

    const handleSelectUser = (user: User) => {
        setCurrentUser(user);
        setMode("view");
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const userId = form.user_id.trim();
            if (mode === "create") {
                if (users.some((user) => user.user_id === userId)) {
                    setError("User id already exists");
                    return;
                }
                await addUser(emptyUser(userId, form.age));
            } else {
                await updateUser({ ...currentUser, age: form.age });
            }
            setMode("view");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Request failed");
        } finally {
            setSaving(false);
        }
    };

    const isEditing = mode === "edit" || mode === "create";

    return (
        <Paper
            elevation={0}
            sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                overflow: "hidden",
                width: "100%",
            }}
        >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                    {users.map((u) => (
                        <Chip
                            key={u.user_id}
                            avatar={
                                <Avatar sx={{ bgcolor: avatarColor(u.user_id), fontSize: 12, color: "white !important" }}>
                                    {initials(u.user_id)}
                                </Avatar>
                            }
                            label={u.user_id}
                            onClick={() => handleSelectUser(u)}
                            variant={currentUser.user_id === u.user_id && mode !== "create" ? "filled" : "outlined"}
                            color={currentUser.user_id === u.user_id && mode !== "create" ? "primary" : "default"}
                            sx={{ fontWeight: currentUser.user_id === u.user_id ? 600 : 400 }}
                        />
                    ))}
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
                {!isEditing ? (
                    <Stack spacing={2.5}>
                        <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
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
                                    {currentUser.age != null && `Age ${currentUser.age}`}
                                    {/*
                                    {currentUser.limits.min_rating != null && ` · min ★ ${currentUser.limits.min_rating}`}
                                    {currentUser.limits.year_from != null &&
                                        ` · ${currentUser.limits.year_from}${currentUser.limits.year_to != null ? `–${currentUser.limits.year_to}` : "+"}`}
                                    {currentUser.limits.year_from == null &&
                                        currentUser.limits.year_to != null &&
                                        ` · –${currentUser.limits.year_to}`}
                                    {currentUser.limits.max_duration_minutes != null &&
                                        ` · ≤ ${currentUser.limits.max_duration_minutes} min`}
                                        */}
                                </Typography>
                            </Box>

                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                    setError(null);
                                    setMode("edit");
                                }}
                            >
                                Edit
                            </Button>
                        </Stack>
                        {/*
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
                            <PreferenceChips
                                label="Watched"
                                items={currentUser.watched.map(
                                    (entry) => `${filmTitle(titles, entry.movie_id)} ${entry.rating}/5`,
                                )}
                            />
                            <PreferenceChips
                                label="Wishlist"
                                items={currentUser.wishlist.map((id) => filmTitle(titles, id))}
                            />
                            <PreferenceChips label="Preferred languages" items={currentUser.likes_language} color="primary" />
                            <PreferenceChips label="Excluded languages" items={currentUser.dislikes_language} color="error" />
                            <PreferenceChips label="Preferred genres" items={currentUser.likes_genre} color="primary" />
                            <PreferenceChips label="Excluded genres" items={currentUser.dislikes_genre} color="error" />
                            {PREFER_GROUPS.map((group) => (
                                <PreferenceChips
                                    key={group.key}
                                    label={group.label}
                                    items={[...currentUser.prefers[group.key]]}
                                />
                            ))}
                            <PreferenceChips label="Required languages" items={limits.required_languages} />
                            <PreferenceChips label="Disliked directors" items={limits.disliked_directors} color="error" />
                            <PreferenceChips label="Disliked actors" items={limits.disliked_stars} color="error" />
                            {limits.session_min_age != null && (
                                <PreferenceChips label="Session minimum age" items={[String(limits.session_min_age)]} />
                            )}
                            {limits.rating_tolerance != null && (
                                <PreferenceChips label="Rating tolerance" items={[String(limits.rating_tolerance)]} />
                            )}
                            {limits.rating_required != null && (
                                <PreferenceChips label="Rating required" items={[yesNo(limits.rating_required)]} />
                            )}
                            {limits.allow_rewatch != null && (
                                <PreferenceChips label="Allow rewatch" items={[yesNo(limits.allow_rewatch)]} />
                            )}
                        </Stack>
                            */}
                    </Stack>
                ) : (
                    <Stack spacing={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {mode === "create" ? "New User" : "Edit User"}
                        </Typography>

                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="User id"
                                value={form.user_id}
                                onChange={(e) => setForm((p) => ({ ...p, user_id: e.target.value }))}
                                size="small"
                                fullWidth
                                autoFocus
                                disabled={mode === "edit"}
                            />
                            <TextField
                                label="Age"
                                type="number"
                                value={form.age || ""}
                                onChange={(e) => setForm((p) => ({ ...p, age: Number(e.target.value) }))}
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
                                onClick={handleSave}
                                disabled={saving || !form.user_id.trim() || form.age <= 0}
                            >
                                Save
                            </Button>
                            <Button
                                variant="text"
                                size="small"
                                startIcon={<CloseIcon />}
                                onClick={() => {
                                    setError(null);
                                    setMode("view");
                                }}
                                disabled={saving}
                                color="inherit"
                            >
                                Cancel
                            </Button>
                        </Stack>
                    </Stack>
                )}
            </Box>
        </Paper>
    );
};

export default UserPanel;
