import { Box, FormControlLabel, Slider, Stack, Switch, TextField, Typography } from "@mui/material";
import { LIMIT_RANGES, limitErrors, type LimitKey, type PreferenceFields } from "../../lib/preferences";
import PreferenceSection from "../common/PreferenceSection";

type Props = {
    form: PreferenceFields;
    errors: ReturnType<typeof limitErrors>;
    userAge: number;
    patch: (changes: Partial<PreferenceFields>) => void;
};

const RATING_MARKS = [0, 2, 4, 6, 8, 10].map((value) => ({ value, label: value ? String(value) : "Any" }));

const toNumber = (text: string) => (text.trim() === "" ? null : Number(text));

const LimitsSection = ({ form, errors, userAge, patch }: Props) => {
    const limitFields: { key: LimitKey; label: string; placeholder: string; hint: string }[] = [
        { key: "max_duration_minutes", label: "Max duration", placeholder: "Any", hint: "In minutes" },
        { key: "session_min_age", label: "Youngest viewer", placeholder: String(userAge), hint: "Defaults to the user's age" },
        { key: "year_from", label: "Released from", placeholder: "Any", hint: "First release year" },
        { key: "year_to", label: "Released until", placeholder: "Any", hint: "Last release year" },
    ];

    const toleranceHint = form.min_rating === null
        ? "Set a minimum rating first"
        : form.rating_required
            ? "Ignored while the minimum is strict"
            : form.rating_tolerance
                ? `Movies from ${Math.max(0, form.min_rating - form.rating_tolerance).toFixed(1)} are kept as alternatives`
                : "Only movies at or above the minimum";

    const setMinRating = (value: number) =>
        patch(value ? { min_rating: value } : { min_rating: null, rating_tolerance: 0, rating_required: false });

    return (
        <PreferenceSection title="Limits" description="Hard limits applied before ranking. Leave a field empty for no limit.">
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                {limitFields.map(({ key, label, placeholder, hint }) => (
                    <TextField
                        key={key}
                        label={label}
                        type="number"
                        size="small"
                        value={form[key] ?? ""}
                        placeholder={placeholder}
                        onChange={(event) => patch({ [key]: toNumber(event.target.value) })}
                        error={Boolean(errors[key])}
                        helperText={errors[key] ?? hint}
                        slotProps={{
                            inputLabel: { shrink: true },
                            htmlInput: { min: LIMIT_RANGES[key][0], max: LIMIT_RANGES[key][1] },
                        }}
                    />
                ))}
            </Box>

            <Box>
                <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Minimum IMDb rating
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {form.min_rating === null ? "Any" : form.min_rating.toFixed(1)}
                    </Typography>
                </Stack>
                <Box sx={{ px: 1 }}>
                    <Slider
                        value={form.min_rating ?? 0}
                        min={0}
                        max={10}
                        step={0.5}
                        marks={RATING_MARKS}
                        valueLabelDisplay="auto"
                        onChange={(_, value) => setMinRating(value as number)}
                        aria-label="Minimum IMDb rating"
                    />
                </Box>
                <FormControlLabel
                    disabled={form.min_rating === null}
                    control={<Switch checked={form.rating_required} onChange={(event) => patch({ rating_required: event.target.checked })} />}
                    label={
                        <Box>
                            <Typography variant="body2">Strict minimum</Typography>
                            <Typography variant="caption" color="text.secondary">
                                Drop every movie below the minimum rating
                            </Typography>
                        </Box>
                    }
                    sx={{ mt: 1 }}
                />
            </Box>

            <Box>
                <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Rating tolerance
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        ±{form.rating_tolerance.toFixed(1)}
                    </Typography>
                </Stack>
                <Box sx={{ px: 1 }}>
                    <Slider
                        value={form.rating_tolerance}
                        min={0}
                        max={5}
                        step={0.5}
                        valueLabelDisplay="auto"
                        disabled={form.min_rating === null || form.rating_required}
                        onChange={(_, value) => patch({ rating_tolerance: value as number })}
                        aria-label="Rating tolerance"
                    />
                </Box>
                <Typography variant="caption" color="text.secondary">
                    {toleranceHint}
                </Typography>
            </Box>

            <FormControlLabel
                control={<Switch checked={form.allow_rewatch} onChange={(event) => patch({ allow_rewatch: event.target.checked })} />}
                label={
                    <Box>
                        <Typography variant="body2">Allow rewatching</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Keep movies already watched in the recommendations
                        </Typography>
                    </Box>
                }
            />
        </PreferenceSection>
    );
};

export default LimitsSection;
