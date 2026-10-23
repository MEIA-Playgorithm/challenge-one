import { Box, IconButton, Rating, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { WatchedMovie, WatchedMovieRating } from "../../types/User";
import { useApp } from "../../context/AppContext";
import { formatLabel } from "../../lib/utils";

const RATING_LABELS = ["Visto, sem opinião", "Não gostei nada", "Não gostei", "Foi razoável", "Gostei", "Gostei muito"];

type Props = {
    item: WatchedMovie;
    onRate: (rating: WatchedMovieRating) => void;
    onRemove: () => void;
};

const WatchedMovieRow = ({ item, onRate, onRemove }: Props) => {
    const { movieById } = useApp();
    const movie = movieById.get(item.movie_id);
    const title = movie?.title ?? item.movie_id;
    const details = movie
        ? [
              movie.year,
              movie.genre.slice(0, 3).map(formatLabel).join(", "),
              movie.rating_imdb === null ? null : `IMDb ${movie.rating_imdb.toFixed(1)}`,
          ]
              .filter(Boolean)
              .join(" · ")
        : "Não está no catálogo";

    return (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" } }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                    {title}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                    {details}
                </Typography>
            </Box>
            <Rating
                name={item.movie_id}
                value={item.rating}
                max={5}
                onChange={(_, value) => onRate((value ?? 0) as WatchedMovieRating)}
                aria-label={`Classificação de ${title}`}
            />
            <Typography variant="caption" color="text.secondary" sx={{ width: { sm: 148 } }}>
                {RATING_LABELS[item.rating]}
            </Typography>
            <IconButton size="small" aria-label={`Remover ${title}`} onClick={onRemove}>
                <CloseIcon fontSize="small" />
            </IconButton>
        </Stack>
    );
};

export default WatchedMovieRow;
