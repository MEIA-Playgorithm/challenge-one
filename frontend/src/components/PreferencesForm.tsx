import { useEffect, useState } from "react";
import { Box, Button, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useApp } from "../context/AppContext";
import type { User } from "../types/User";
import { GENRES, LANGUAGES } from "../mocks/data";
import RankedSelector from "./RankedSelector";
import ExcludeSelector from "./ExcludeSelector";

type PrefFields = Pick<
  User,
  | "preferredLanguages"
  | "excludedLanguages"
  | "preferredGenres"
  | "excludedGenres"
  | "minRating"
  | "yearFrom"
  | "yearTo"
  | "maxDuration"
>;

function fromUser(u: User): PrefFields {
  return {
    preferredLanguages: [...u.preferredLanguages],
    excludedLanguages: [...u.excludedLanguages],
    preferredGenres: [...u.preferredGenres],
    excludedGenres: [...u.excludedGenres],
    minRating: u.minRating,
    yearFrom: u.yearFrom,
    yearTo: u.yearTo,
    maxDuration: u.maxDuration,
  };
}

function optionalNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export default function PreferencesForm() {
  const { currentUser, updateUser } = useApp();
  const [form, setForm] = useState<PrefFields>(() => fromUser(currentUser));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm(fromUser(currentUser));
    setDirty(false);
  }, [currentUser]);

  const patch = <K extends keyof PrefFields>(key: K, value: PrefFields[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  return (
    <Paper
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, p: 3, height: 500, overflow: "auto" }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
        Taste profile
      </Typography>

      <Stack spacing={3} divider={<Divider flexItem />}>
        <RankedSelector
          label="Preferred languages"
          all={LANGUAGES}
          selected={form.preferredLanguages}
          excluded={form.excludedLanguages}
          maxItems={5}
          onChange={(next) => patch("preferredLanguages", next)}
        />

        <ExcludeSelector
          label="Excluded languages"
          all={LANGUAGES}
          selected={form.excludedLanguages}
          blocked={form.preferredLanguages}
          onChange={(next) => patch("excludedLanguages", next)}
        />

        <RankedSelector
          label="Preferred genres"
          all={GENRES}
          selected={form.preferredGenres}
          excluded={form.excludedGenres}
          maxItems={5}
          onChange={(next) => patch("preferredGenres", next)}
        />

        <ExcludeSelector
          label="Excluded genres"
          all={GENRES}
          selected={form.excludedGenres}
          blocked={form.preferredGenres}
          onChange={(next) => patch("excludedGenres", next)}
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Min rating"
            type="number"
            size="small"
            value={form.minRating ?? ""}
            onChange={(e) => patch("minRating", optionalNumber(e.target.value))}
            slotProps={{ htmlInput: { min: 0, max: 10, step: 0.1 } }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Year from"
            type="number"
            size="small"
            value={form.yearFrom ?? ""}
            onChange={(e) => patch("yearFrom", optionalNumber(e.target.value))}
            slotProps={{ htmlInput: { min: 1900, max: 2100 } }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Year to"
            type="number"
            size="small"
            value={form.yearTo ?? ""}
            onChange={(e) => patch("yearTo", optionalNumber(e.target.value))}
            slotProps={{ htmlInput: { min: 1900, max: 2100 } }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Max duration (min)"
            type="number"
            size="small"
            value={form.maxDuration ?? ""}
            onChange={(e) => patch("maxDuration", optionalNumber(e.target.value))}
            slotProps={{ htmlInput: { min: 1, max: 400 } }}
            sx={{ flex: 1 }}
          />
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<CheckIcon />}
          onClick={() => {
            updateUser({ ...currentUser, ...form });
            setDirty(false);
          }}
          disabled={!dirty}
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
          }}
          disabled={!dirty}
          color="inherit"
        >
          Cancel
        </Button>
      </Stack>
    </Paper>
  );
}
