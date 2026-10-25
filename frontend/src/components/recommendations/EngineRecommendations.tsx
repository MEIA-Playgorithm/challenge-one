import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Chip, CircularProgress, Collapse, IconButton, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useRecommendations } from "../../hooks/useRecommendations";
import { config, type EngineId } from "../../lib/config";
import { formatLabel } from "../../lib/utils";
import type { Recommendation } from "../../types/Recommendation";
import RecommendationExplanation from "./RecommendationExplanation";

type Props = {
    engine: EngineId;
    showTitle: boolean;
};

// Uma recomendação, com a explicação num dropdown.
// `top` é o vencedor; quando existe, este item ficou atrás dele e mostra porque não.
const RecommendationItem = ({ recommendation, rank, top }: { recommendation: Recommendation; rank: number; top?: Recommendation }) => {
    const [open, setOpen] = useState(false);
    const { movie, score, status } = recommendation;

    return (
        <li>
            <ListItem disableGutters>
                <ListItemText
                    primary={`${rank}. ${movie.title}`}
                    secondary={`${movie.genre.slice(0, 3).map(formatLabel).join(", ")} · IMDb ${movie.rating_imdb?.toFixed(1) ?? "?"} · ${score} pts`}
                />
                {!top && <Chip label="recomendado" color="primary" size="small" sx={{ mr: 0.5 }} />}
                {status === "alternative" && <Chip label="alternativa" size="small" />}
                <IconButton
                    size="small"
                    aria-label={`Explicar ${movie.title}`}
                    aria-expanded={open}
                    onClick={() => setOpen(!open)}
                    sx={{ transform: open ? "rotate(180deg)" : "none" }}
                >
                    <ExpandMoreIcon />
                </IconButton>
            </ListItem>
            <Collapse in={open} unmountOnExit>
                <RecommendationExplanation recommendation={recommendation} top={top} />
            </Collapse>
        </li>
    );
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
                    Sem filmes elegíveis.
                </Typography>
            )}
            <List dense>
                {items.map((recommendation, index) => (
                    <RecommendationItem
                        key={recommendation.movie.id}
                        recommendation={recommendation}
                        rank={index + 1}
                        top={index > 0 ? items[0] : undefined}
                    />
                ))}
            </List>
        </section>
    );
};

export default EngineRecommendations;
