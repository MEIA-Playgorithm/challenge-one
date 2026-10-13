import { Chip, CircularProgress, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useApp } from "../context/AppContext";
import { useRecommendations } from "../hooks/useRecommendations";
import { config, type EngineId } from "../lib/config";

type Props = {
    engine: EngineId;
    showTitle: boolean;
};

// As recomendações do utilizador atual segundo um motor, com o estado desse motor.
const EngineRecommendations = ({ engine, showTitle }: Props) => {
    const { currentUser, engineStatus } = useApp();
    const reload = engineStatus[engine];
    const { items, loading, error } = useRecommendations(engine, currentUser, reload);

    return (
        <section>
            {showTitle && (
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {config.engines[engine].label}
                </Typography>
            )}
            {loading && <CircularProgress size={24} sx={{ m: 2 }} />}
            {/* Se o motor não responde, o erro do pedido já o diz; o aviso de reload só interessa quando o motor responde. */}
            {reload.error && !error && (
                <Typography color="warning.main" variant="body2">
                    {reload.error}
                </Typography>
            )}
            {error && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}
            {!loading && !error && items.length === 0 && (
                <Typography color="text.secondary" variant="body2">
                    No eligible movies.
                </Typography>
            )}
            <List dense>
                {items.map(({ movie, score, status }) => (
                    <ListItem key={movie.id} disableGutters>
                        <ListItemText
                            primary={movie.title}
                            secondary={`${movie.genre.slice(0, 3).join(", ")} · IMDb ${movie.rating_imdb ?? "?"} · ${score} pts`}
                        />
                        {status === "alternative" && <Chip label="alternative" size="small" />}
                    </ListItem>
                ))}
            </List>
        </section>
    );
};

export default EngineRecommendations;
