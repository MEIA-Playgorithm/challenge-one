import { Box, Chip, Stack, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { formatLabel } from "../lib/utils";

type Props<T extends string> = {
    label: string;
    options: readonly T[];
    value: T[];
    onChange: (value: T[]) => void;
};

const ChoiceChips = <T extends string>({ label, options, value, onChange }: Props<T>) => {
    const toggle = (option: T) =>
        onChange(
            value.includes(option)
                ? value.filter((item) => item !== option)
                : options.filter((item) => item === option || value.includes(item))
        );

    return (
        <Box>
            <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {value.length ? `${value.length} selected` : "Any"}
                </Typography>
            </Stack>
            <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 0.75 }}>
                {options.map((option) => {
                    const selected = value.includes(option);
                    return (
                        <Chip
                            key={option}
                            label={formatLabel(option)}
                            size="small"
                            icon={selected ? <CheckIcon /> : undefined}
                            color={selected ? "primary" : "default"}
                            variant={selected ? "filled" : "outlined"}
                            onClick={() => toggle(option)}
                            sx={{ fontWeight: selected ? 600 : 400 }}
                        />
                    );
                })}
            </Stack>
        </Box>
    );
};

export default ChoiceChips;
