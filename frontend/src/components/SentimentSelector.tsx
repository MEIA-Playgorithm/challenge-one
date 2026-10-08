import { Box, Chip, Stack, Typography } from "@mui/material";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import { formatLabel } from "../lib/utils";

type Props = {
    label: string;
    options: string[];
    liked: string[];
    disliked: string[];
    onChange: (liked: string[], disliked: string[]) => void;
};

const SentimentSelector = ({ label, options, liked, disliked, onChange }: Props) => {
    const items = [...new Set([...options, ...liked, ...disliked])].sort((a, b) => a.localeCompare(b));

    const cycle = (item: string) => {
        if (liked.includes(item)) {
            onChange(
                liked.filter((value) => value !== item),
                [...disliked, item]
            );
        } else if (disliked.includes(item)) {
            onChange(
                liked,
                disliked.filter((value) => value !== item)
            );
        } else {
            onChange([...liked, item], disliked);
        }
    };

    return (
        <Box>
            <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {liked.length} liked · {disliked.length} disliked
                </Typography>
            </Stack>
            <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 0.75 }}>
                {items.map((item) => {
                    const isLiked = liked.includes(item);
                    const isDisliked = disliked.includes(item);
                    return (
                        <Chip
                            key={item}
                            label={formatLabel(item)}
                            size="small"
                            icon={isLiked ? <ThumbUpAltIcon /> : isDisliked ? <ThumbDownAltIcon /> : undefined}
                            color={isLiked ? "primary" : isDisliked ? "error" : "default"}
                            variant={isLiked ? "filled" : "outlined"}
                            onClick={() => cycle(item)}
                            sx={{ fontWeight: isLiked || isDisliked ? 600 : 400 }}
                        />
                    );
                })}
            </Stack>
        </Box>
    );
};

export default SentimentSelector;
