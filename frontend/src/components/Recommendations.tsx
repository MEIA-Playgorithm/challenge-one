import { useEffect, useRef, useState } from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { useApp } from "../context/AppContext";
import { engineUrl } from "../api/client";
import {
  health,
  similarMovies,
  userRecommendations,
  type Explanation,
  type Reason,
  type ScoreBreakdown,
  type SimilarItem,
  type UserRecommendation,
} from "../api/inference";
import { movieHeading, movieMeta } from "../lib/movies";

function points(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function words(type: string) {
  return type.replace(/_/g, " ");
}

function reasonLabel(reason: Reason) {
  const name = words(reason.type);
  if (reason.movie_id) return `${name} ${reason.movie_id}`;
  if (reason.value != null && reason.value !== "") return `${name} ${reason.value}`;
  return name;
}

function explanationLabel(item: Explanation) {
  const name = words(item.type);
  const args = item.arguments ?? [];
  return args.length ? `${name} ${args.join(" · ")}` : name;
}

function breakdownLabel(breakdown: ScoreBreakdown) {
  return (["genre", "rating", "director", "star", "secondary"] as const)
    .map((key) => `${key} ${points(breakdown[key])}`)
    .join(" · ");
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

function clock(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function ChipGroup({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <Box sx={{ mt: 1.25 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {items.map((item, index) => (
          <Chip key={`${item}-${index}`} size="small" label={item} variant="outlined" />
        ))}
      </Box>
    </Box>
  );
}

export default function Recommendations() {
  const { currentUser } = useApp();
  const [healthOk, setHealthOk] = useState<boolean | null>(null);
  const [items, setItems] = useState<UserRecommendation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [similarFor, setSimilarFor] = useState<string | null>(null);
  const [similar, setSimilar] = useState<SimilarItem[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const similarAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    similarAbort.current?.abort();
    setSimilarFor(null);
    setSimilar([]);
    setSimilarError(null);
    setLoading(true);
    setError(null);
    setHealthOk(null);
    setItems([]);
    setTotal(0);
    setLoadedAt(null);

    health(controller.signal)
      .then(() => {
        if (!controller.signal.aborted) setHealthOk(true);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHealthOk(false);
      });

    userRecommendations(currentUser.user_id, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setItems(data.items);
        setTotal(data.total);
        setLoadedAt(new Date());
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(message(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [currentUser.user_id, reloadKey]);

  const toggleSimilar = (movieId: string) => {
    if (similarFor === movieId) {
      similarAbort.current?.abort();
      setSimilarFor(null);
      return;
    }

    similarAbort.current?.abort();
    const controller = new AbortController();
    similarAbort.current = controller;
    setSimilarFor(movieId);
    setSimilar([]);
    setSimilarError(null);
    setSimilarLoading(true);

    similarMovies(movieId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setSimilar(data.items);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setSimilarError(message(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setSimilarLoading(false);
      });
  };

  const healthLabel =
    healthOk == null ? "Checking engine" : healthOk ? "Engine reachable" : `Engine unreachable at ${engineUrl}`;

  return (
    <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
      <Box sx={{ p: 3, pb: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "baseline", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "baseline", minWidth: 0, flexWrap: "wrap" }}>
            <Typography variant="h6">Recommendations</Typography>
            {!loading && !error && (
              <Typography variant="caption" color="text.secondary">
                {items.length} of {total}
              </Typography>
            )}
            <Button size="small" disabled={loading} onClick={() => setReloadKey((n) => n + 1)} sx={{ py: 0, minWidth: 0 }}>
              Reload
            </Button>
            {loadedAt && (
              <Typography variant="caption" color="text.secondary">
                {clock(loadedAt)}
              </Typography>
            )}
          </Stack>
          <Typography variant="caption" color={healthOk === false ? "error" : "text.secondary"} sx={{ flexShrink: 0 }}>
            {healthLabel}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Engine profile for {currentUser.user_id}. Taste-form edits stay on this page and are not sent.
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ px: 3, pb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Loading…
          </Typography>
        </Box>
      )}

      {!loading && error && (
        <Box sx={{ px: 3, pb: 3 }}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Box>
      )}

      {!loading && !error && items.length === 0 && (
        <Box sx={{ px: 3, pb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No eligible films.
          </Typography>
        </Box>
      )}

      {!loading && !error && items.length > 0 && (
        <Stack spacing={0} divider={<Box sx={{ borderTop: 1, borderColor: "divider" }} />}>
          {items.map((item) => {
            const heading = movieHeading(item.movie);
            const meta = movieMeta(item.movie);
            const genres = item.movie.genre ?? [];
            return (
              <Box key={item.movie.id} sx={{ px: 3, py: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    alignItems: { sm: "center" },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", alignItems: "baseline" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {item.movie.title}
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
                    {genres.length > 0 && (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.75 }}>
                        {genres.map((genre) => (
                          <Chip key={genre} label={genre} size="small" variant="outlined" />
                        ))}
                      </Box>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexShrink: 0 }}>
                    <Chip
                      size="small"
                      label={item.status}
                      color={item.status === "main" ? "primary" : "default"}
                      variant={item.status === "alternative" ? "outlined" : "filled"}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {points(item.score)}
                    </Typography>
                  </Stack>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  {breakdownLabel(item.score_breakdown)}
                </Typography>

                <ChipGroup label="Why" items={item.reasons.map(reasonLabel)} />
                <ChipGroup label="Limits met" items={item.satisfied_requirements.map(explanationLabel)} />
                <ChipGroup label="Not matched" items={item.unmet_preferences.map(explanationLabel)} />

                <Button size="small" sx={{ mt: 1, px: 0 }} onClick={() => toggleSimilar(item.movie.id)}>
                  {similarFor === item.movie.id ? "Hide similar" : "Similar films"}
                </Button>

                {similarFor === item.movie.id && (
                  <Box sx={{ mt: 1, pl: 1.5, borderLeft: 1, borderColor: "divider" }}>
                    {similarLoading && (
                      <Typography variant="body2" color="text.secondary">
                        Loading…
                      </Typography>
                    )}
                    {similarError && (
                      <Typography variant="body2" color="error">
                        {similarError}
                      </Typography>
                    )}
                    {!similarLoading && !similarError && similar.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No similar films.
                      </Typography>
                    )}
                    {!similarLoading &&
                      !similarError &&
                      similar.map((entry) => {
                        const detail = movieHeading(entry.movie);
                        return (
                          <Typography key={entry.movie.id} variant="body2" color="text.secondary">
                            {entry.movie.title}
                            {detail ? ` · ${detail}` : ""} · {points(entry.score)}
                          </Typography>
                        );
                      })}
                  </Box>
                )}
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}
