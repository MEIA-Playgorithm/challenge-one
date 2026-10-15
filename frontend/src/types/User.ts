export const PACES = ["slow", "medium", "fast"] as const;
export const LEVELS = ["low", "medium", "high"] as const;
export const EMOTIONAL_TONES = ["tense", "dark", "sad", "lighthearted", "romantic", "reflective", "exciting"] as const;
export const THEMES = [
    "love",
    "family",
    "growing_up",
    "crime",
    "justice",
    "war",
    "history",
    "technology",
    "supernatural",
    "exploration",
    "psychology",
    "music",
    "sport",
    "life_story",
] as const;
export const AUDIENCES = ["mainstream", "niche"] as const;
export const ERAS = ["classic", "modern", "recent"] as const;
export const POPULARITIES = ["very_popular", "popular", "less_popular"] as const;

export type Pace = (typeof PACES)[number];
export type Level = (typeof LEVELS)[number];
export type EmotionalTone = (typeof EMOTIONAL_TONES)[number];
export type Theme = (typeof THEMES)[number];
export type Audience = (typeof AUDIENCES)[number];
export type Era = (typeof ERAS)[number];
export type Popularity = (typeof POPULARITIES)[number];
export type WatchedMovieRating = 0 | 1 | 2 | 3 | 4 | 5;

export type WatchedMovie = {
    movie_id: string;
    rating: WatchedMovieRating;
};

export type User = {
    user_id: string;
    age: number;
    watched: WatchedMovie[];
    wishlist: string[];
    preferred_genres: string[];
    disliked_genres: string[];
    preferred_languages: string[];
    disliked_languages: string[];
    preferred_directors: string[];
    preferred_writers: string[];
    preferred_stars: string[];
    preferred_countries: string[];
    preferred_subgenres: string[];
    preferred_pace: Pace[];
    preferred_complexity: Level[];
    preferred_violence: Level[];
    preferred_humor: Level[];
    preferred_psychological_intensity: Level[];
    preferred_emotional_tones: EmotionalTone[];
    preferred_themes: Theme[];
    preferred_audience: Audience[];
    preferred_eras: Era[];
    preferred_popularity: Popularity[];
    max_duration_minutes: number | null;
    year_from: number | null;
    year_to: number | null;
    required_languages: string[];
    disliked_directors: string[];
    disliked_stars: string[];
    session_min_age: number | null;
    min_rating: number | null;
    rating_tolerance: number;
    rating_required: boolean;
    allow_rewatch: boolean;
};

export function emptyUser(userId: string, age: number): User {
    return {
        user_id: userId,
        age,
        watched: [],
        wishlist: [],
        preferred_genres: [],
        disliked_genres: [],
        preferred_languages: [],
        disliked_languages: [],
        preferred_directors: [],
        preferred_writers: [],
        preferred_stars: [],
        preferred_countries: [],
        preferred_subgenres: [],
        preferred_pace: [],
        preferred_complexity: [],
        preferred_violence: [],
        preferred_humor: [],
        preferred_psychological_intensity: [],
        preferred_emotional_tones: [],
        preferred_themes: [],
        preferred_audience: [],
        preferred_eras: [],
        preferred_popularity: [],
        max_duration_minutes: null,
        year_from: null,
        year_to: null,
        required_languages: [],
        disliked_directors: [],
        disliked_stars: [],
        session_min_age: null,
        min_rating: null,
        rating_tolerance: 0,
        rating_required: false,
        allow_rewatch: false,
    };
}
