export type Pace = "slow" | "medium" | "fast";
export type Level = "low" | "medium" | "high";
export type EmotionalTone = "tense" | "dark" | "sad" | "lighthearted" | "romantic" | "reflective" | "exciting";
export type Theme =
    | "love"
    | "family"
    | "growing_up"
    | "crime"
    | "justice"
    | "war"
    | "history"
    | "technology"
    | "supernatural"
    | "exploration"
    | "psychology"
    | "music"
    | "sport"
    | "life_story";
export type Audience = "mainstream" | "niche";
export type Era = "classic" | "modern" | "recent";
export type Popularity = "very_popular" | "popular" | "less_popular";
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
    max_duration_minutes: number;
    year_from: number;
    year_to: number;
    required_languages: string[];
    disliked_directors: string[];
    disliked_stars: string[];
    session_min_age: number;
    min_rating: number;
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
        max_duration_minutes: 0,
        year_from: 0,
        year_to: 0,
        required_languages: [],
        disliked_directors: [],
        disliked_stars: [],
        session_min_age: 0,
        min_rating: 0,
        rating_tolerance: 0,
        rating_required: false,
        allow_rewatch: false,
    };
}
