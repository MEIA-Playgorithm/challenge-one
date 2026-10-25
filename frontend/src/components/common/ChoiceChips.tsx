import { Box, Chip, Stack, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { formatLabel } from "../../lib/utils";

type Props<T extends string> = {
    label: string;
    options: readonly T[];
    value: T[];
    onChange: (value: T[]) => void;
    // Rótulo, chips e contador na mesma linha (para listas de várias escolhas curtas).
    inline?: boolean;
};

const ChoiceChips = <T extends string>({ label, options, value, onChange, inline = false }: Props<T>) => {
    const toggle = (option: T) =>
        onChange(
            value.includes(option)
                ? value.filter((item) => item !== option)
                : options.filter((item) => item === option || value.includes(item))
        );

    const counter = (
        <Typography variant="caption" color="textSecondary">
            {value.length ? `${value.length} selecionado${value.length > 1 ? "s" : ""}` : "Qualquer"}
        </Typography>
    );

    const chips = (
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
    );

    if (inline) {
        return (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1, sm: 2 }} sx={{ alignItems: { sm: "center" } }}>
                <Typography variant="body2" sx={{ width: { sm: 200 }, flexShrink: 0, fontWeight: 500 }}>
                    {label}
                </Typography>
                <Box sx={{ flex: 1 }}>{chips}</Box>
                {counter}
            </Stack>
        );
    }

    return (
        <Box>
            <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {label}
                </Typography>
                {counter}
            </Stack>
            {chips}
        </Box>
    );
};

export default ChoiceChips;
