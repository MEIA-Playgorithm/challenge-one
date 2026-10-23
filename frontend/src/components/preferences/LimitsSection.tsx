import { Box, FormControlLabel, Slider, Stack, Switch, TextField, Typography } from "@mui/material";
import { LIMIT_RANGES, limitErrors, type LimitKey, type PreferenceFields } from "../../lib/preferences";
import PreferenceSection from "../common/PreferenceSection";

type Props = {
    form: PreferenceFields;
    errors: ReturnType<typeof limitErrors>;
    userAge: number;
    patch: (changes: Partial<PreferenceFields>) => void;
};

const RATING_MARKS = [0, 2, 4, 6, 8, 10].map((value) => ({ value, label: value ? String(value) : "Qualquer" }));

const toNumber = (text: string) => (text.trim() === "" ? null : Number(text));

const LimitsSection = ({ form, errors, userAge, patch }: Props) => {
    const limitFields: { key: LimitKey; label: string; placeholder: string; hint: string }[] = [
        { key: "max_duration_minutes", label: "Duração máxima", placeholder: "Qualquer", hint: "Em minutos" },
        { key: "session_min_age", label: "Espectador mais novo", placeholder: String(userAge), hint: "Por omissão, a idade do utilizador" },
        { key: "year_from", label: "Lançado desde", placeholder: "Qualquer", hint: "Primeiro ano de lançamento" },
        { key: "year_to", label: "Lançado até", placeholder: "Qualquer", hint: "Último ano de lançamento" },
    ];

    const toleranceHint = form.min_rating === null
        ? "Define primeiro uma classificação mínima"
        : form.rating_required
            ? "Ignorada enquanto o mínimo for estrito"
            : form.rating_tolerance
                ? `Filmes a partir de ${Math.max(0, form.min_rating - form.rating_tolerance).toFixed(1)} ficam como alternativas`
                : "Só filmes iguais ou acima do mínimo";

    const setMinRating = (value: number) =>
        patch(value ? { min_rating: value } : { min_rating: null, rating_tolerance: 0, rating_required: false });

    return (
        <PreferenceSection title="Limites" description="Limites estritos aplicados antes da ordenação. Deixa um campo vazio para não ter limite.">
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
                        Classificação IMDb mínima
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {form.min_rating === null ? "Qualquer" : form.min_rating.toFixed(1)}
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
                        aria-label="Classificação IMDb mínima"
                    />
                </Box>
                <FormControlLabel
                    disabled={form.min_rating === null}
                    control={<Switch checked={form.rating_required} onChange={(event) => patch({ rating_required: event.target.checked })} />}
                    label={
                        <Box>
                            <Typography variant="body2">Mínimo estrito</Typography>
                            <Typography variant="caption" color="text.secondary">
                                Exclui todos os filmes abaixo da classificação mínima
                            </Typography>
                        </Box>
                    }
                    sx={{ mt: 1 }}
                />
            </Box>

            <Box>
                <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Tolerância da classificação
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
                        aria-label="Tolerância da classificação"
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
                        <Typography variant="body2">Permitir rever</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Mantém nas recomendações os filmes já vistos
                        </Typography>
                    </Box>
                }
            />
        </PreferenceSection>
    );
};

export default LimitsSection;
