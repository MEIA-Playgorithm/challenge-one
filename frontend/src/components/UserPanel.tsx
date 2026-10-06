import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
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
import type { User } from "../types/User";
import { emptyUserFields } from "../types/User";
import { avatarColor, initials } from "../lib/utils";
import PreferenceChips from "./PreferenceChips";

type Mode = "view" | "edit" | "create";

const UserPanel = () => {
  const { users, currentUser, setCurrentUser, addUser, updateUser } = useApp();
  const [mode, setMode] = useState<Mode>("view");
  const [form, setForm] = useState({ name: "", age: 0 });

  useEffect(() => {
    if (mode === "edit") {
      setForm({ name: currentUser.name, age: currentUser.age });
    }
  }, [mode, currentUser]);

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setMode("view");
  };

  const handleSave = () => {
    if (mode === "create") {
      addUser({ ...emptyUserFields(), name: form.name.trim(), age: form.age });
    } else {
      updateUser({ ...currentUser, name: form.name.trim(), age: form.age });
    }
    setMode("view");
  };

  const isEditing = mode === "edit" || mode === "create";

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 2, bgcolor: "grey.50" }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          {users.map((u) => (
            <Chip
              key={u.id}
              avatar={
                <Avatar sx={{ bgcolor: avatarColor(u.id), fontSize: 12, color :'white !important'}}>
                  {initials(u.name)}
                </Avatar>
              }
              label={u.name}
              onClick={() => handleSelectUser(u)}
              variant={currentUser.id === u.id && mode !== "create" ? "filled" : "outlined"}
              color={currentUser.id === u.id && mode !== "create" ? "primary" : "default"}
              sx={{ fontWeight: currentUser.id === u.id ? 600 : 400 }}
            />
          ))}
          <Tooltip title="New user">
            <Chip
              icon={<AddIcon />}
              label="New"
              onClick={() => {
                setForm({ name: "", age: 0 });
                setMode("create");
              }}
              variant={mode === "create" ? "filled" : "outlined"}
              color={mode === "create" ? "secondary" : "default"}
            />
          </Tooltip>
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ p: 3 }}>
        {!isEditing ? (
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: avatarColor(currentUser.id),
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                {initials(currentUser.name)}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {currentUser.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Age {currentUser.age}
                  {currentUser.minRating != null && ` · min ★ ${currentUser.minRating}`}
                  {currentUser.yearFrom != null &&
                    ` · ${currentUser.yearFrom}${currentUser.yearTo ? ` - ${currentUser.yearTo}` : "+"}`}
                  {currentUser.maxDuration != null && ` · ≤ ${currentUser.maxDuration} min`}
                </Typography>
              </Box>

              <Button variant="outlined" size="small" onClick={() => setMode("edit")}>
                Edit
              </Button>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
              <PreferenceChips label="Preferred languages" items={currentUser.preferredLanguages} color="primary" />
              <PreferenceChips label="Excluded languages" items={currentUser.excludedLanguages} color="error" />
              <PreferenceChips label="Preferred genres" items={currentUser.preferredGenres} color="primary" />
              <PreferenceChips label="Excluded genres" items={currentUser.excludedGenres} color="error" />
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {mode === "create" ? "New User" : "Edit User"}
            </Typography>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                size="small"
                fullWidth
                autoFocus
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

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                startIcon={<CheckIcon />}
                onClick={handleSave}
                disabled={!form.name.trim() || form.age <= 0}
              >
                Save
              </Button>
              <Button variant="text" size="small" startIcon={<CloseIcon />} onClick={() => setMode("view")} color="inherit">
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
