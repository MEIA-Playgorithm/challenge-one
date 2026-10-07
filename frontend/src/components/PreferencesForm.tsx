import { useEffect, useState } from "react";
import { Box, Button, Divider, Stack, TextField, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useApp } from "../context/AppContext";
import type { User, UserLimits } from "../types/User";
import { GENRES, LANGUAGES } from "../mocks/data";
import RankedSelector from "./RankedSelector";
import ExcludeSelector from "./ExcludeSelector";

type PrefFields = {
  likes_language: string[];
  dislikes_language: string[];
  likes_genre: string[];
  dislikes_genre: string[];
  min_rating?: number;
  year_from?: number;
  year_to?: number;
  max_duration_minutes?: number;
};

function fromUser(user: User): PrefFields {
  return {
    likes_language: [...user.likes_language],
    dislikes_language: [...user.dislikes_language],
    likes_genre: [...user.likes_genre],
    dislikes_genre: [...user.dislikes_genre],
    min_rating: user.limits.min_rating,
    year_from: user.limits.year_from,
    year_to: user.limits.year_to,
    max_duration_minutes: user.limits.max_duration_minutes,
  };
}

function optionalNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function limitsFromForm(current: UserLimits, form: PrefFields): UserLimits {
  const limits: UserLimits = { ...current };
  const assign = (
    key: "min_rating" | "year_from" | "year_to" | "max_duration_minutes",
    value: number | undefined,
  ) => {
    if (value == null) delete limits[key];
    else limits[key] = value;
  };
  assign("min_rating", form.min_rating);
  assign("year_from", form.year_from);
  assign("year_to", form.year_to);
  assign("max_duration_minutes", form.max_duration_minutes);
  if (limits.min_rating == null) {
    delete limits.rating_tolerance;
    delete limits.rating_required;
  }
  return limits;
}

export default function PreferencesForm() {
  const { currentUser, updateUser } = useApp();
  const [form, setForm] = useState<PrefFields>(() => fromUser(currentUser));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(fromUser(currentUser));
    setDirty(false);
    setError(null);
  }, [currentUser]);

  const patch = <K extends keyof PrefFields>(key: K, value: PrefFields[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2.5 }}>
        Taste profile
      </Typography>

      <Stack spacing={3} divider={<Divider flexItem />}>
        <RankedSelector
          label="Preferred languages"
          all={LANGUAGES}
          selected={form.likes_language}
          excluded={form.dislikes_language}
          maxItems={5}
          onChange={(next) => patch("likes_language", next)}
        />

        <ExcludeSelector
          label="Excluded languages"
          all={LANGUAGES}
          selected={form.dislikes_language}
          blocked={form.likes_language}
          onChange={(next) => patch("dislikes_language", next)}
        />

        <RankedSelector
          label="Preferred genres"
          all={GENRES}
          selected={form.likes_genre}
          excluded={form.dislikes_genre}
          maxItems={5}
          onChange={(next) => patch("likes_genre", next)}
        />

        <ExcludeSelector
          label="Excluded genres"
          all={GENRES}
          selected={form.dislikes_genre}
          blocked={form.likes_genre}
          onChange={(next) => patch("dislikes_genre", next)}
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Min rating"
            type="number"
            size="small"
            value={form.min_rating ?? ""}
            onChange={(e) => patch("min_rating", optionalNumber(e.target.value))}
            slotProps={{ htmlInput: { min: 0, max: 10, step: 0.1 } }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Year from"
            type="number"
            size="small"
            value={form.year_from ?? ""}
            onChange={(e) => patch("year_from", optionalNumber(e.target.value))}
            slotProps={{ htmlInput: { min: 1800, max: 3000 } }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Year to"
            type="number"
            size="small"
            value={form.year_to ?? ""}
            onChange={(e) => patch("year_to", optionalNumber(e.target.value))}
            slotProps={{ htmlInput: { min: 1800, max: 3000 } }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Max duration (min)"
            type="number"
            size="small"
            value={form.max_duration_minutes ?? ""}
            onChange={(e) => patch("max_duration_minutes", optionalNumber(e.target.value))}
            slotProps={{ htmlInput: { min: 1, max: 1440 } }}
            sx={{ flex: 1 }}
          />
        </Stack>
      </Stack>

      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Stack direction="row" spacing={1} sx={{ mt: error ? 1 : 3 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<CheckIcon />}
          onClick={async () => {
            if (form.year_from != null && form.year_to != null && form.year_from > form.year_to) {
              setError("Year from is after year to");
              return;
            }
            setSaving(true);
            setError(null);
            try {
              await updateUser({
                ...currentUser,
                likes_language: form.likes_language,
                dislikes_language: form.dislikes_language,
                likes_genre: form.likes_genre,
                dislikes_genre: form.dislikes_genre,
                limits: limitsFromForm(currentUser.limits, form),
              });
              setDirty(false);
            } catch (err: unknown) {
              setError(err instanceof Error ? err.message : "Request failed");
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving || !dirty}
        >
          Save preferences
        </Button>
        <Button
          variant="text"
          size="small"
          startIcon={<CloseIcon />}
          onClick={() => {
            setForm(fromUser(currentUser));
            setDirty(false);
            setError(null);
          }}
          disabled={saving || !dirty}
          color="inherit"
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
}
