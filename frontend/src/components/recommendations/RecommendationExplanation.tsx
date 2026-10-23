import { Box, Typography } from "@mui/material";
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

// Porque foi recomendado, como a pontuação se compõe e o que não cumpre.
const RecommendationExplanation = ({ recommendation }: { recommendation: Recommendation }) => {
    const { reasons, score_breakdown, unmet_preferences } = recommendation;
    const breakdown = Object.entries(score_breakdown ?? {}).map(([part, points]) => `${label(part)}: ${points} pts`);

    return (
        <Box sx={{ display: "grid", gap: 1, pl: 1, pb: 1 }}>
            <Section title="Why it was recommended" lines={(reasons ?? []).map(reasonText)} />
            <Section title="Score" lines={breakdown} />
            <Section title="Preferences not met" lines={(unmet_preferences ?? []).map(unmetText)} />
        </Box>
    );
};

export default RecommendationExplanation;
