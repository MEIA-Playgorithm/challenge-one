import { Box, Chip, Stack, Typography, type ChipProps } from "@mui/material";
import type { Recommendation, Reason, UnmetPreference } from "../../types/Recommendation";

const label = (type: string) => type.replace(/_/g, " ");

const reasonText = ({ type, value, movie_id }: Reason) => {
    const detail = value ?? movie_id;
    return detail === undefined ? label(type) : `${label(type)}: ${detail}`;
};

const unmetText = ({ type, arguments: args }: UnmetPreference) =>
    args.length === 0 ? label(type) : `${label(type)}: ${args.join(", ")}`;

type Line = { text: string; color?: ChipProps["color"] };

// Um bloco do dropdown: título e uma linha de chips, por ordem alfabética (os motores
// devolvem-nos por ordens diferentes).
const Section = ({ title, lines }: { title: string; lines: Line[] }) =>
    lines.length === 0 ? null : (
        <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {title}
            </Typography>
            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                {[...lines].sort((a, b) => a.text.localeCompare(b.text, "pt", { numeric: true })).map(({ text, color }) => (
                    <Chip key={text} label={text} color={color} size="small" variant="outlined" />
                ))}
            </Stack>
        </Box>
    );

// Porque não ficou em primeiro: pontos atrás do vencedor, partes da pontuação onde perde
// e preferências que falha mas o vencedor cumpre.
const whyNotLines = (recommendation: Recommendation, top: Recommendation) => {
    const own = recommendation.score_breakdown ?? {};
    const best = top.score_breakdown ?? {};
    const gap = Math.round((top.score - recommendation.score) * 100) / 100;
    // Cor por significado: âmbar = perde pontos, sem cor = preferência que não cumpre.
    const lines: Line[] = [
        { text: gap > 0 ? `${gap} pts atrás de ${top.movie.title}` : `empatado com ${top.movie.title}, perdeu no desempate`, color: "warning" },
    ];
    for (const part of new Set([...Object.keys(own), ...Object.keys(best)])) {
        const diff = (best[part] ?? 0) - (own[part] ?? 0);
        if (diff > 0) lines.push({ text: `${label(part)}: menos ${Math.round(diff * 100) / 100} pts`, color: "warning" });
    }
    const topUnmet = new Set((top.unmet_preferences ?? []).map(unmetText));
    for (const text of (recommendation.unmet_preferences ?? []).map(unmetText)) {
        if (!topUnmet.has(text)) lines.push({ text: `não cumpre ${text}` });
    }
    return lines;
};

// Os mesmos três blocos em todos os filmes. O primeiro diz porque foi recomendado
// (o 1.º da lista) ou porque ficou atrás dele (os outros).
const RecommendationExplanation = ({ recommendation, top }: { recommendation: Recommendation; top?: Recommendation }) => {
    const { reasons, score_breakdown, unmet_preferences } = recommendation;

    return (
        <Box sx={{ display: "grid", gap: 1.5, pb: 1 }}>
            {top ? (
                <Section title="Porque ficou atrás do 1.º" lines={whyNotLines(recommendation, top)} />
            ) : (
                <Section title="Porque foi recomendado" lines={(reasons ?? []).map((reason) => ({ text: reasonText(reason), color: "primary" }))} />
            )}
            <Section title="Pontuação" lines={Object.entries(score_breakdown ?? {}).map(([part, points]) => ({ text: `${label(part)}: ${points} pts` }))} />
            <Section title="Preferências não cumpridas" lines={(unmet_preferences ?? []).map((unmet) => ({ text: unmetText(unmet) }))} />
        </Box>
    );
};

export default RecommendationExplanation;
