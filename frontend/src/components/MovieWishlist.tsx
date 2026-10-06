import { useMemo, useState } from "react";
import {
  Box,
  Chip,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useApp } from "../context/AppContext";
import { MOVIES } from "../mocks/data";
import type { PreferenceStatus } from "../types/Movie";
import { PREFERENCE_STATUS_LABELS } from "../types/Movie";
import StatusToggle from "./StatusToggle";

type FilterTab = "all" | PreferenceStatus | "unrated";

const FILTERS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unrated", label: "Unrated" },
  { value: "liked", label: PREFERENCE_STATUS_LABELS.liked },
  { value: "disliked", label: PREFERENCE_STATUS_LABELS.disliked },
  { value: "want_to_see", label: PREFERENCE_STATUS_LABELS.want_to_see },
  { value: "skip", label: PREFERENCE_STATUS_LABELS.skip },
];

export default function MovieWishlist() {
  const { movieStatuses, setMovieStatus } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");

  const counts = useMemo(() => {
    const c: Record<FilterTab, number> = {
      all: MOVIES.length,
      unrated: 0,
      liked: 0,
      disliked: 0,
      want_to_see: 0,
      skip: 0,
    };
    for (const m of MOVIES) {
      const s = movieStatuses[m.id];
      if (!s) c.unrated += 1;
      else c[s] += 1;
    }
    return c;
  }, [movieStatuses]);

  const movies = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOVIES.filter((m) => {
      const status = movieStatuses[m.id] ?? null;
      if (filter === "unrated" && status !== null) return false;
      if (filter !== "all" && filter !== "unrated" && status !== filter) return false;
      if (!q) return true;
      return (
        m.title.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q) ||
        m.genres.some((g) => g.toLowerCase().includes(q)) ||
        m.language.toLowerCase().includes(q) ||
        m.actors.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [query, filter, movieStatuses]);

  return (
    <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
      <Box sx={{ p: 3, pb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Movie wishlist
        </Typography>

        <TextField
          size="small"
          placeholder="Search title, genre, director, actor…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          sx={{ mt: 2 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Tabs
        value={filter}
        onChange={(_, v: FilterTab) => setFilter(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}
      >
        {FILTERS.map((f) => (
          <Tab
            key={f.value}
            value={f.value}
            label={`${f.label} (${counts[f.value]})`}
            sx={{ textTransform: "none", minHeight: 48 }}
          />
        ))}
      </Tabs>

      <Stack
        spacing={0}
        divider={<Box sx={{ borderBottom: 1, borderColor: "divider" }} />}
        sx={{ overflow: "auto", maxHeight: 500 }}
      >
        {movies.length === 0 && (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No movies match this filter.
            </Typography>
          </Box>
        )}
        {movies.map((m) => {
          const status = movieStatuses[m.id] ?? null;
          return (
            <Box
              key={m.id}
              sx={{
                px: 3,
                py: 2,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                alignItems: { sm: "center" },
                bgcolor: status ? "action.hover" : "transparent",
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "baseline" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {m.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {m.year}
                  </Typography>
                  <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
                    ★ {m.rating.toFixed(1)}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {m.director} · {m.language} · {m.duration ? `${m.duration} min · ` : ""}
                  {m.country}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, flexWrap: "wrap", gap: 0.5 }}>
                  {m.genres.map((g) => (
                    <Chip key={g} label={g} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
              <StatusToggle value={status} onChange={(next) => setMovieStatus(m.id, next)} />
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
