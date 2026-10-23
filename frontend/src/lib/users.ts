import type { Audience, EmotionalTone, Era, Level, Pace, Popularity, Theme, User, WatchedMovie } from "../types/User";
import { csvFields } from "./csv";

function list(value: string) {
    return value ? value.split("|") : [];
}

function optionalNumber(value: string) {
    return value ? Number(value) : null;
}

function watched(value: string): WatchedMovie[] {
    return list(value).map((item) => {
        const [movie_id, rating] = item.split("=");
        // A movie without a rating ("tt123", old format) counts as 0, as in the engines.
        return { movie_id, rating: (Number(rating) || 0) as WatchedMovie["rating"] };
    });
}

// Age is optional: 0 means unset. Engines only accept integers from 0 to 120.
export const MAX_AGE = 120;
export const ageError = (age: number) =>
    Number.isInteger(age) && age >= 0 && age <= MAX_AGE ? null : `Número inteiro de 1 a ${MAX_AGE}, ou vazio`;

// Converte o conteúdo de knowledge_base/users.csv em utilizadores.
export function parseUsersCsv(csv: string): User[] {
    const [header, ...rows] = csv.trim().split(/\r?\n/);
    const columns = csvFields(header);
    return rows.map((row) => {
        const cells = csvFields(row);
        const values = Object.fromEntries(columns.map((column, index) => [column, cells[index]]));
        return {
            user_id: values.user_id,
            age: Number(values.age),
            watched: watched(values.watched),
            wishlist: list(values.wishlist),
            preferred_genres: list(values.preferred_genres),
            disliked_genres: list(values.disliked_genres),
            preferred_languages: list(values.preferred_languages),
            disliked_languages: list(values.disliked_languages),
            preferred_directors: list(values.preferred_directors),
            preferred_writers: list(values.preferred_writers),
            preferred_stars: list(values.preferred_stars),
            preferred_countries: list(values.preferred_countries),
            preferred_subgenres: list(values.preferred_subgenres),
            preferred_pace: list(values.preferred_pace) as Pace[],
            preferred_complexity: list(values.preferred_complexity) as Level[],
            preferred_violence: list(values.preferred_violence) as Level[],
            preferred_humor: list(values.preferred_humor) as Level[],
            preferred_psychological_intensity: list(values.preferred_psychological_intensity) as Level[],
            preferred_emotional_tones: list(values.preferred_emotional_tones) as EmotionalTone[],
            preferred_themes: list(values.preferred_themes) as Theme[],
            preferred_audience: list(values.preferred_audience) as Audience[],
            preferred_eras: list(values.preferred_eras) as Era[],
            preferred_popularity: list(values.preferred_popularity) as Popularity[],
            max_duration_minutes: optionalNumber(values.max_duration_minutes),
            year_from: optionalNumber(values.year_from),
            year_to: optionalNumber(values.year_to),
            required_languages: list(values.required_languages),
            disliked_directors: list(values.disliked_directors),
            disliked_stars: list(values.disliked_stars),
            session_min_age: optionalNumber(values.session_min_age),
            min_rating: optionalNumber(values.min_rating),
            rating_tolerance: Number(values.rating_tolerance),
            rating_required: values.rating_required === "true",
            allow_rewatch: values.allow_rewatch === "true",
        };
    });
}

// Inverso de parseUsersCsv: um utilizador como linha do CSV (nome da coluna -> texto).
export function userToRow(user: User): Record<string, string> {
    const { watched, min_rating, rating_tolerance, rating_required, ...rest } = user;
    // A tolerância e a obrigatoriedade só fazem sentido com uma classificação mínima.
    const hasMinRating = min_rating !== null;
    const row: Record<string, string> = {};
    for (const [column, value] of Object.entries(rest)) {
        row[column] = Array.isArray(value) ? value.join("|") : value === null ? "" : String(value);
    }
    // Age 0 means unset (empty CSV reads as 0); engines would read 0 years and only
    // recommend all-ages movies.
    row.age = user.age ? String(user.age) : "";
    row.watched = watched.map((item) => `${item.movie_id}=${item.rating}`).join("|");
    row.min_rating = hasMinRating ? String(min_rating) : "";
    row.rating_tolerance = hasMinRating ? String(rating_tolerance) : "";
    row.rating_required = hasMinRating ? String(rating_required) : "";
    return row;
}
