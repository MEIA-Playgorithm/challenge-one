import { useState } from "react";
import {
    Autocomplete,
    Box,
    Button,
    Divider,
    FormControlLabel,
    Slider,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useApp } from "../context/AppContext";
import { AUDIENCES, EMOTIONAL_TONES, ERAS, LEVELS, PACES, POPULARITIES, THEMES, type User } from "../types/User";
import { GENRES, LANGUAGES, SUBGENRES } from "../mocks/data";
import { formatLabel } from "../lib/utils";
import PreferenceSection from "./PreferenceSection";
import SentimentSelector from "./SentimentSelector";
import ChoiceGroup from "./ChoiceGroup";
import ChoiceChips from "./ChoiceChips";

const PREFERENCE_KEYS = [
    "preferred_genres",
    "disliked_genres",
    "preferred_subgenres",
    "preferred_languages",
    "disliked_languages",
    "required_languages",
    "preferred_pace",
    "preferred_complexity",
    "preferred_violence",
    "preferred_humor",
    "preferred_psychological_intensity",
    "preferred_audience",
    "preferred_eras",
    "preferred_popularity",
    "preferred_emotional_tones",
    "preferred_themes",
    "max_duration_minutes",
    "year_from",
    "year_to",
    "session_min_age",
    "min_rating",
    "rating_tolerance",
    "rating_required",
    "allow_rewatch",
] as const satisfies readonly (keyof User)[];

type PreferenceFields = Pick<User, (typeof PREFERENCE_KEYS)[number]>;
type LimitKey = "max_duration_minutes" | "year_from" | "year_to" | "session_min_age";

// Same bounds as user_limit_column/2 in swi-prolog/user_bc.pl.
const LIMIT_RANGES: Record<LimitKey, [number, number]> = {
    max_duration_minutes: [1, 1440],
    year_from: [1800, 3000],
    year_to: [1800, 3000],
    session_min_age: [0, 120],
};

const RATING_MARKS = [0, 2, 4, 6, 8, 10].map((value) => ({ value, label: value ? String(value) : "Any" }));

const fromUser = (user: User) =>
    Object.fromEntries(PREFERENCE_KEYS.map((key) => [key, user[key]])) as PreferenceFields;

const sameValue = (a: unknown, b: unknown) =>
    Array.isArray(a) && Array.isArray(b) ? a.length === b.length && a.every((item) => b.includes(item)) : a === b;

const withValues = (options: string[], values: string[]) => [...new Set([...options, ...values])];

const toNumber = (text: string) => (text.trim() === "" ? null : Number(text));

const limitErrors = (form: PreferenceFields) => {
    const errors: Partial<Record<LimitKey, string>> = {};
    for (const [key, [min, max]] of Object.entries(LIMIT_RANGES) as [LimitKey, [number, number]][]) {
        const value = form[key];
        if (value !== null && (!Number.isInteger(value) || value < min || value > max)) {
            errors[key] = `Whole number from ${min} to ${max}`;
        }
    }
    if (
        !errors.year_from &&
        !errors.year_to &&
        form.year_from !== null &&
        form.year_to !== null &&
        form.year_from > form.year_to
    ) {
        errors.year_to = "Must not be before the start year";
    }
    return errors;
};

const Preferences = () => {
    const { currentUser, updateUser } = useApp();
    const [form, setForm] = useState<PreferenceFields>(() => fromUser(currentUser));

    const patch = (changes: Partial<PreferenceFields>) => setForm((current) => ({ ...current, ...changes }));

    const errors = limitErrors(form);
    const hasErrors = Object.keys(errors).length > 0;
    const dirty = PREFERENCE_KEYS.some((key) => !sameValue(form[key], currentUser[key]));

    const dislikedSubgenres = form.disliked_genres.filter((genre) => SUBGENRES.includes(genre));
    const dislikedMainGenres = form.disliked_genres.filter((genre) => !SUBGENRES.includes(genre));

    const limitFields: { key: LimitKey; label: string; placeholder: string; hint: string }[] = [
        { key: "max_duration_minutes", label: "Max duration", placeholder: "Any", hint: "In minutes" },
        { key: "session_min_age", label: "Youngest viewer", placeholder: String(currentUser.age), hint: "Defaults to the user's age" },
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

    const save = () => {
        updateUser(currentUser.user_id, { ...currentUser, ...form });
    };

    return (
        <Stack sx={{ minHeight: "100%" }}>
            <Stack spacing={3} divider={<Divider flexItem />} sx={{ flex: 1, pb: 3 }}>
                <PreferenceSection
                    title="Genres"
                    description="Liked genres weigh the most and disliked genres exclude a movie. Click a chip to like, dislike or clear it."
                >
                    <SentimentSelector
                        label="Main genres"
                        options={GENRES}
                        liked={form.preferred_genres}
                        disliked={dislikedMainGenres}
                        onChange={(liked, disliked) =>
                            patch({ preferred_genres: liked, disliked_genres: [...disliked, ...dislikedSubgenres] })
                        }
                    />
                    <Autocomplete
                        multiple
                        size="small"
                        filterSelectedOptions
                        options={withValues(SUBGENRES, form.preferred_subgenres).filter(
                            (genre) => !dislikedSubgenres.includes(genre)
                        )}
                        value={form.preferred_subgenres}
                        onChange={(_, value) => patch({ preferred_subgenres: value })}
                        getOptionLabel={formatLabel}
                        slotProps={{ chip: { size: "small", color: "primary" } }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Preferred subgenres"
                                placeholder={form.preferred_subgenres.length ? "" : "Any"}
                                helperText="Finer matches on top of the genres"
                            />
                        )}
                    />
                    <Autocomplete
                        multiple
                        size="small"
                        filterSelectedOptions
                        options={SUBGENRES}
                        value={dislikedSubgenres}
                        onChange={(_, value) =>
                            patch({
                                disliked_genres: [...dislikedMainGenres, ...value],
                                preferred_subgenres: form.preferred_subgenres.filter((genre) => !value.includes(genre)),
                            })
                        }
                        getOptionLabel={formatLabel}
                        slotProps={{ chip: { size: "small", color: "error", variant: "outlined" } }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Disliked subgenres"
                                placeholder={dislikedSubgenres.length ? "" : "None"}
                                helperText="Excludes any movie tagged with these"
                            />
                        )}
                    />
                </PreferenceSection>

                <PreferenceSection
                    title="Languages"
                    description="Liked languages add to the score and disliked ones exclude a movie. Required languages are a hard filter."
                >
                    <SentimentSelector
                        label="Spoken languages"
                        options={LANGUAGES}
                        liked={form.preferred_languages}
                        disliked={form.disliked_languages}
                        onChange={(liked, disliked) =>
                            patch({
                                preferred_languages: liked,
                                disliked_languages: disliked,
                                required_languages: form.required_languages.filter((language) => !disliked.includes(language)),
                            })
                        }
                    />
                    <Autocomplete
                        multiple
                        size="small"
                        filterSelectedOptions
                        options={withValues(LANGUAGES, form.required_languages).filter(
                            (language) => !form.disliked_languages.includes(language)
                        )}
                        value={form.required_languages}
                        onChange={(_, value) => patch({ required_languages: value })}
                        slotProps={{ chip: { size: "small" } }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Required languages"
                                placeholder={form.required_languages.length ? "" : "Any"}
                                helperText="Movies must be in at least one of these"
                            />
                        )}
                    />
                </PreferenceSection>

                <PreferenceSection
                    title="Movie traits"
                    description="Pick every value that suits you. Leave a row empty for no preference."
                >
                    <Stack spacing={1.5}>
                        <ChoiceGroup
                            label="Pace"
                            options={PACES}
                            value={form.preferred_pace}
                            onChange={(value) => patch({ preferred_pace: value })}
                        />
                        <ChoiceGroup
                            label="Complexity"
                            options={LEVELS}
                            value={form.preferred_complexity}
                            onChange={(value) => patch({ preferred_complexity: value })}
                        />
                        <ChoiceGroup
                            label="Violence"
                            options={LEVELS}
                            value={form.preferred_violence}
                            onChange={(value) => patch({ preferred_violence: value })}
                        />
                        <ChoiceGroup
                            label="Humor"
                            options={LEVELS}
                            value={form.preferred_humor}
                            onChange={(value) => patch({ preferred_humor: value })}
                        />
                        <ChoiceGroup
                            label="Psychological intensity"
                            options={LEVELS}
                            value={form.preferred_psychological_intensity}
                            onChange={(value) => patch({ preferred_psychological_intensity: value })}
                        />
                    </Stack>
                    <Stack spacing={1.5}>
                        <ChoiceGroup
                            label="Audience"
                            options={AUDIENCES}
                            value={form.preferred_audience}
                            onChange={(value) => patch({ preferred_audience: value })}
                        />
                        <ChoiceGroup
                            label="Era"
                            options={ERAS}
                            value={form.preferred_eras}
                            onChange={(value) => patch({ preferred_eras: value })}
                        />
                        <ChoiceGroup
                            label="Popularity"
                            options={POPULARITIES}
                            value={form.preferred_popularity}
                            onChange={(value) => patch({ preferred_popularity: value })}
                        />
                    </Stack>
                </PreferenceSection>

                <PreferenceSection title="Mood and themes" description="The tone and subjects a movie should lean towards.">
                    <ChoiceChips
                        label="Emotional tones"
                        options={EMOTIONAL_TONES}
                        value={form.preferred_emotional_tones}
                        onChange={(value) => patch({ preferred_emotional_tones: value })}
                    />
                    <ChoiceChips
                        label="Themes"
                        options={THEMES}
                        value={form.preferred_themes}
                        onChange={(value) => patch({ preferred_themes: value })}
                    />
                </PreferenceSection>

                <PreferenceSection
                    title="Limits"
                    description="Hard limits applied before ranking. Leave a field empty for no limit."
                >
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
                            control={
                                <Switch
                                    checked={form.rating_required}
                                    onChange={(event) => patch({ rating_required: event.target.checked })}
                                />
                            }
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
                        control={
                            <Switch
                                checked={form.allow_rewatch}
                                onChange={(event) => patch({ allow_rewatch: event.target.checked })}
                            />
                        }
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
            </Stack>

            <Box
                sx={{
                    position: "sticky",
                    bottom: -16,
                    zIndex: 1,
                    mx: -2,
                    mb: -2,
                    px: 2,
                    py: 1.5,
                    borderTop: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                }}
            >
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography
                        variant="body2"
                        color={hasErrors ? "error" : dirty ? "primary" : "text.secondary"}
                        sx={{ flex: 1 }}
                    >
                        {hasErrors ? "Fix the highlighted limits to save" : dirty ? "Unsaved changes" : "All changes saved"}
                    </Typography>
                    <Button
                        variant="text"
                        size="small"
                        color="inherit"
                        startIcon={<CloseIcon />}
                        disabled={!dirty}
                        onClick={() => setForm(fromUser(currentUser))}
                    >
                        Reset
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckIcon />}
                        disabled={!dirty || hasErrors}
                        onClick={save}
                    >
                        Save
                    </Button>
                </Stack>
            </Box>
        </Stack>
    );
};

export default Preferences;
