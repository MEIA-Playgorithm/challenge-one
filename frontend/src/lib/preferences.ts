import type { User } from "../types/User";

export const PREFERENCE_KEYS = [
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

export type PreferenceFields = Pick<User, (typeof PREFERENCE_KEYS)[number]>;
export type LimitKey = "max_duration_minutes" | "year_from" | "year_to" | "session_min_age";

export const LIMIT_RANGES: Record<LimitKey, [number, number]> = {
    max_duration_minutes: [1, 1440],
    year_from: [1800, 3000],
    year_to: [1800, 3000],
    session_min_age: [0, 120],
};

export const preferencesOf = (user: User) =>
    Object.fromEntries(PREFERENCE_KEYS.map((key) => [key, user[key]])) as PreferenceFields;

const sameValue = (a: unknown, b: unknown) =>
    Array.isArray(a) && Array.isArray(b) ? a.length === b.length && a.every((item) => b.includes(item)) : a === b;

export const preferencesChanged = (form: PreferenceFields, user: User) =>
    PREFERENCE_KEYS.some((key) => !sameValue(form[key], user[key]));

export const limitErrors = (form: PreferenceFields) => {
    const errors: Partial<Record<LimitKey, string>> = {};
    for (const [key, [min, max]] of Object.entries(LIMIT_RANGES) as [LimitKey, [number, number]][]) {
        const value = form[key];
        if (value !== null && (!Number.isInteger(value) || value < min || value > max)) {
            errors[key] = `Número inteiro de ${min} a ${max}`;
        }
    }
    if (
        !errors.year_from &&
        !errors.year_to &&
        form.year_from !== null &&
        form.year_to !== null &&
        form.year_from > form.year_to
    ) {
        errors.year_to = "Não pode ser anterior ao ano inicial";
    }
    return errors;
};
