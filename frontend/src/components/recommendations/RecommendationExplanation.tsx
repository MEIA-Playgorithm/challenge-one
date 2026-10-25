import { Box, Chip, Stack, Typography, type ChipProps } from "@mui/material";
import type { Recommendation, Reason, UnmetPreference } from "../../types/Recommendation";

const label = (type: string) => type.replace(/_/g, " ");

const reasonText = ({ type, value, movie_id }: Reason) => {
    const detail = value ?? movie_id;
    return detail === undefined ? label(type) : `${label(type)}: ${detail}`;
};

const unmetText = ({ type, arguments: args }: UnmetPreference) =>
    args.length === 0 ? label(type) : `${label(type)}: ${args.join(", ")}`;

type SectionProps = { title: string; lines: string[] };

const Section = ({ title, lines }: SectionProps) =>
    lines.length === 0 ? null : (
        <Box>
            <Typography variant="caption" color="text.secondary">
                {title}
            </Typography>
            {lines.map((line) => (
                <Typography key={line} variant="body2">
                    {line}
                </Typography>
            ))}
        </Box>
    );

// Porque não ficou em primeiro: pontos atrás do vencedor, partes da pontuação onde perde
// e preferências que falha mas o vencedor cumpre.
const whyNotLines = (recommendation: Recommendation, top: Recommendation) => {
    const own = recommendation.score_breakdown ?? {};
    const best = top.score_breakdown ?? {};
    const gap = Math.round((top.score - recommendation.score) * 100) / 100;
    // Cor por tipo: distância ao vencedor, pontos perdidos, preferência falhada.
    const lines: { text: string; color: ChipProps["color"] }[] = [
        { text: gap > 0 ? `${gap} pts atrás de ${top.movie.title}` : `empatado com ${top.movie.title}, perdeu no desempate`, color: "error" },
    ];
    for (const part of new Set([...Object.keys(own), ...Object.keys(best)])) {
        const diff = (best[part] ?? 0) - (own[part] ?? 0);
        if (diff > 0) lines.push({ text: `${label(part)}: menos ${Math.round(diff * 100) / 100} pts`, color: "warning" });
    }
    const topUnmet = new Set((top.unmet_preferences ?? []).map(unmetText));
    for (const text of (recommendation.unmet_preferences ?? []).map(unmetText)) {
        if (!topUnmet.has(text)) lines.push({ text: `não cumpre ${text}`, color: "info" });
    }
    return lines;
};

// Porque foi recomendado, como a pontuação se compõe e o que não cumpre.
const RecommendationExplanation = ({ recommendation, top }: { recommendation: Recommendation; top?: Recommendation }) => {
    const { reasons, score_breakdown, unmet_preferences } = recommendation;
    const breakdown = Object.entries(score_breakdown ?? {}).map(([part, points]) => `${label(part)}: ${points} pts`);

    return (
        <Box sx={{ display: "grid", gap: 1, pl: 1, pb: 1 }}>
            {top && (
                <Box>
                    <Typography variant="caption" color="text.secondary">
                        Porque não foi o recomendado
                    </Typography>
                    <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                        {whyNotLines(recommendation, top).map(({ text, color }) => (
                            <Chip key={text} label={text} color={color} size="small" variant="outlined" />
                        ))}
                    </Stack>
                </Box>
            )}
            <Section title="Porque foi recomendado" lines={(reasons ?? []).map(reasonText)} />
            <Section title="Pontuação" lines={breakdown} />
            <Section title="Preferências não cumpridas" lines={(unmet_preferences ?? []).map(unmetText)} />
        </Box>
    );
};

export default RecommendationExplanation;
