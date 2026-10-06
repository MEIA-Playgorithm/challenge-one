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
import { ACTORS, DIRECTORS, WRITERS, COMPANIES, COUNTRIES } from "../mocks/data";
import type { CreditCategory, CreditItem } from "../types/Person";
import type { PreferenceStatus } from "../types/Movie";
import { PREFERENCE_STATUS_LABELS } from "../types/Movie";
import StatusToggle from "./StatusToggle";

const CATEGORIES: { value: CreditCategory; label: string; items: CreditItem[] }[] = [
  { value: "actor", label: "Actors", items: ACTORS },
  { value: "director", label: "Directors", items: DIRECTORS },
  { value: "writer", label: "Writers", items: WRITERS },
  { value: "company", label: "Studios", items: COMPANIES },
  { value: "country", label: "Countries", items: COUNTRIES },
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

export default function CreditsWishlist() {
  const { creditStatuses, setCreditStatus } = useApp();
  const [category, setCategory] = useState<CreditCategory>("actor");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  const catalog = CATEGORIES.find((c) => c.value === category)!.items;

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((item) => {
      const status = creditStatuses[item.id] ?? null;
      if (statusFilter === "unrated" && status !== null) return false;
      if (statusFilter !== "all" && statusFilter !== "unrated" && status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return item.name.toLowerCase().includes(q);
    });
  }, [catalog, query, statusFilter, creditStatuses]);

  const ratedInCategory = catalog.filter((i) => creditStatuses[i.id]).length;

  return (
    <Paper
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}
    >
      <Box sx={{ p: 3, pb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          People & origins
        </Typography>

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
        sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}
      >
        {CATEGORIES.map((c) => (
          <Tab
            key={c.value}
            value={c.value}
            label={c.label}
            sx={{ textTransform: "none", minHeight: 48 }}
          />
        ))}
      </Tabs>

      <Box sx={{ px: 2, py: 1.5, display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
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

      <Stack
        spacing={0}
        divider={<Box sx={{ borderBottom: 1, borderColor: "divider" }} />}
        sx={{ overflow: "auto", height: 500 }}
      >
        {items.length === 0 && (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No entries match this filter.
            </Typography>
          </Box>
        )}
        {items.map((item) => {
          const status = creditStatuses[item.id] ?? null;
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
              <Typography variant="body1" sx={{ fontWeight: status ? 600 : 400 }}>
                {item.name}
              </Typography>
              <StatusToggle value={status} onChange={(next) => setCreditStatus(item.id, next)} />
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
