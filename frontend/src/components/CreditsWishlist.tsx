import { useMemo, useState } from "react";
import {
  Box,
  Chip,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useApp } from "../context/AppContext";
import type { User } from "../types/User";
import { useCatalog } from "../api/useCatalog";
import type { Movie } from "../types/Movie";
import type { CreditCategory, CreditItem } from "../types/Person";
import type { PreferenceStatus } from "../types/Movie";
import { PREFERENCE_STATUS_LABELS } from "../types/Movie";
import { useDebouncedValue } from "../lib/useDebouncedValue";
import StatusToggle from "./StatusToggle";

const CATEGORY_FIELDS: { value: CreditCategory; label: string; field: CreditCategory }[] = [
  { value: "star", label: "Actors", field: "star" },
  { value: "director", label: "Directors", field: "director" },
  { value: "writer", label: "Writers", field: "writer" },
  { value: "production_company", label: "Studios", field: "production_company" },
  { value: "country_origin", label: "Countries", field: "country_origin" },
];

type StatusFilter = "all" | PreferenceStatus | "unrated";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unrated", label: "Unrated" },
  { value: "liked", label: PREFERENCE_STATUS_LABELS.liked },
  { value: "disliked", label: PREFERENCE_STATUS_LABELS.disliked },
  { value: "want_to_see", label: PREFERENCE_STATUS_LABELS.want_to_see },
  { value: "skip", label: PREFERENCE_STATUS_LABELS.skip },
];

function profileMark(user: User, item: CreditItem): "preferred" | "excluded" | null {
  if (item.category === "director" && user.limits.disliked_directors.includes(item.name)) return "excluded";
  if (item.category === "star" && user.limits.disliked_stars.includes(item.name)) return "excluded";
  if (item.category === "director" && user.prefers.director.includes(item.name)) return "preferred";
  if (item.category === "writer" && user.prefers.writer.includes(item.name)) return "preferred";
  if (item.category === "star" && user.prefers.star.includes(item.name)) return "preferred";
  if (item.category === "country_origin" && user.prefers.country_origin.includes(item.name)) return "preferred";
  return null;
}

function creditsFor(movies: Movie[], category: CreditCategory, field: CreditCategory): CreditItem[] {
  const names = new Set<string>();
  for (const movie of movies) {
    const values = movie[field];
    if (!Array.isArray(values)) continue;
    for (const name of values) {
      if (name) names.add(name);
    }
  }
  return [...names]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ id: `${category}:${name}`, name, category }));
}

export default function CreditsWishlist() {
  const { currentUser, creditStatuses, setCreditStatus } = useApp();
  const { movies, loading, error } = useCatalog();
  const [category, setCategory] = useState<CreditCategory>("star");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);

  const groups = useMemo(
    () =>
      CATEGORY_FIELDS.map((entry) => ({
        ...entry,
        items: creditsFor(movies, entry.value, entry.field),
      })),
    [movies],
  );
  const catalog = groups.find((entry) => entry.value === category)?.items ?? [];

  const items = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return catalog.filter((item) => {
      const status = creditStatuses[item.id] ?? null;
      if (statusFilter === "unrated" && status !== null) return false;
      if (statusFilter !== "all" && statusFilter !== "unrated" && status !== statusFilter) return false;
      if (!q) return true;
      return item.name.toLowerCase().includes(q);
    });
  }, [catalog, debouncedQuery, statusFilter, creditStatuses]);

  const ratedInCategory = catalog.filter((item) => creditStatuses[item.id]).length;

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Box sx={{ p: 3, pb: 1.5, flexShrink: 0 }}>
        <Typography variant="h6">People & origins</Typography>

        <TextField
          size="small"
          placeholder="Search…"
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
        value={category}
        onChange={(_, v: CreditCategory) => {
          setCategory(v);
          setStatusFilter("all");
        }}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ px: 2, borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
      >
        {groups.map((entry) => (
          <Tab key={entry.value} value={entry.value} label={entry.label} />
        ))}
      </Tabs>

      <Box sx={{ px: 2, py: 1.5, display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center", flexShrink: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
          {ratedInCategory}/{catalog.length} rated
        </Typography>
        {STATUS_FILTERS.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            size="small"
            variant={statusFilter === f.value ? "filled" : "outlined"}
            color={statusFilter === f.value ? "primary" : "default"}
            onClick={() => setStatusFilter(f.value)}
          />
        ))}
      </Box>

      {loading && (
        <Box sx={{ px: 3, py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Loading…
          </Typography>
        </Box>
      )}

      {!loading && error && (
        <Box sx={{ px: 3, py: 3 }}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Box>
      )}

      {!loading && !error && (
        <Stack
          spacing={0}
          divider={<Box sx={{ borderBottom: 1, borderColor: "divider" }} />}
          sx={{ flex: 1, minHeight: 0, overflow: "auto" }}
        >
          {items.length === 0 && (
            <Box sx={{ px: 3, py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No entries match this filter.
              </Typography>
            </Box>
          )}
          {items.map((item) => {
            const status = creditStatuses[item.id] ?? null;
            const mark = profileMark(currentUser, item);
            return (
              <Box
                key={item.id}
                sx={{
                  px: 3,
                  py: 1.5,
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  justifyContent: "space-between",
                  bgcolor: status ? "action.hover" : "transparent",
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
                  <Typography variant="body1" sx={{ fontWeight: status ? 600 : 400 }}>
                    {item.name}
                  </Typography>
                  {mark === "preferred" && <Chip label="Preferred" size="small" color="primary" />}
                  {mark === "excluded" && <Chip label="Excluded" size="small" color="error" variant="outlined" />}
                </Stack>
                <StatusToggle value={status} onChange={(next) => setCreditStatus(item.id, next)} />
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
