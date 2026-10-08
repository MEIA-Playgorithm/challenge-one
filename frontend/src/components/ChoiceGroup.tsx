import { Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { formatLabel } from "../lib/utils";

type Props<T extends string> = {
    label: string;
    options: readonly T[];
    value: T[];
    onChange: (value: T[]) => void;
};

const ChoiceGroup = <T extends string>({ label, options, value, onChange }: Props<T>) => {
    return (
        <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
        >
            <Typography variant="body2">{label}</Typography>
            <ToggleButtonGroup
                size="small"
                color="primary"
                value={value}
                onChange={(_, next: T[]) => onChange(options.filter((option) => next.includes(option)))}
                aria-label={label}
                sx={{
                    width: { xs: "100%", sm: 360 },
                    "& .MuiToggleButton-root": { flex: 1, py: 0.5, color: "text.secondary" },
                    "& .MuiToggleButton-root.Mui-selected": {
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        fontWeight: 600,
                        "&:hover": { bgcolor: "primary.dark" },
                    },
                }}
            >
                {options.map((option) => (
                    <ToggleButton key={option} value={option}>
                        {formatLabel(option)}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Stack>
    );
};

export default ChoiceGroup;
