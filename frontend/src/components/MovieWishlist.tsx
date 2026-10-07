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
import { useCatalog } from "../api/useCatalog";
import type { Movie } from "../types/Movie";
import { movieHeading, movieMeta } from "../lib/movies";
import { useDebouncedValue } from "../lib/useDebouncedValue";
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

function matchesQuery(movie: Movie, query: string) {
  const fields = [movie.title, ...(movie.director ?? []), ...(movie.genre ?? []), ...(movie.language ?? []), ...(movie.star ?? [])];
  return fields.some((value) => value.toLowerCase().includes(query));
}

export default function MovieWishlist() {
  const { currentUser, movieStatuses, setMovieStatus } = useApp();
  const { movies: catalog, loading, error } = useCatalog();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [filter, setFilter] = useState<FilterTab>("all");

  const watchedRating = useMemo(
    () => new Map(currentUser.watched.map((entry) => [entry.movie_id, entry.rating])),
    [currentUser.watched],
  );
  const wishlistIds = useMemo(() => new Set(currentUser.wishlist), [currentUser.wishlist]);

  const counts = useMemo(() => {
    const c: Record<FilterTab, number> = {
      all: catalog.length,
      unrated: 0,
      liked: 0,
      disliked: 0,
      want_to_see: 0,
      skip: 0,
    };
    for (const movie of catalog) {
      const status = movieStatuses[movie.id];
      if (!status) c.unrated += 1;
      else c[status] += 1;
    }
    return c;
  }, [catalog, movieStatuses]);

  const movies = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return catalog.filter((movie) => {
      const status = movieStatuses[movie.id] ?? null;
      if (filter === "unrated" && status !== null) return false;
      if (filter !== "all" && filter !== "unrated" && status !== filter) return false;
      if (!q) return true;
      return matchesQuery(movie, q);
    });
  }, [catalog, debouncedQuery, filter, movieStatuses]);

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 3, pb: 1.5, flexShrink: 0 }}>
        <Typography variant="h6">Movie wishlist</Typography>

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
        sx={{ px: 2, borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
      >
        {FILTERS.map((f) => (
          <Tab key={f.value} value={f.value} label={`${f.label} (${counts[f.value]})`} />
        ))}
      </Tabs>

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
          {movies.length === 0 && (
            <Box sx={{ px: 3, py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No movies match this filter.
              </Typography>
            </Box>
          )}
          {movies.map((movie) => {
            const status = movieStatuses[movie.id] ?? null;
            const heading = movieHeading(movie);
            const meta = movieMeta(movie);
            const genres = movie.genre ?? [];
            const watched = watchedRating.get(movie.id);
            const onWishlist = wishlistIds.has(movie.id);
            return (
              <Box
                key={movie.id}
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
                  <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", alignItems: "baseline" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {movie.title}
                    </Typography>
                    {heading && (
                      <Typography variant="body2" color="text.secondary">
                        {heading}
                      </Typography>
                    )}
                  </Stack>
                  {meta && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {meta}
                    </Typography>
                  )}
                  {(genres.length > 0 || watched != null || onWishlist) && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.75 }}>
                      {watched != null && <Chip label={`Watched ${watched}/5`} size="small" />}
                      {onWishlist && <Chip label="Wishlist" size="small" color="primary" />}
                      {genres.map((genre) => (
                        <Chip key={genre} label={genre} size="small" variant="outlined" />
                      ))}
                    </Box>
                  )}
                </Box>
                <StatusToggle value={status} onChange={(next) => setMovieStatus(movie.id, next)} />
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
