export const PACES = ["slow", "medium", "fast"] as const;
export type Pace = (typeof PACES)[number];

export const LEVELS = ["low", "medium", "high"] as const;
export type Level = (typeof LEVELS)[number];

export const EMOTIONAL_TONES = [
  "tense",
  "dark",
  "sad",
  "lighthearted",
  "romantic",
  "reflective",
  "exciting",
] as const;
export type EmotionalTone = (typeof EMOTIONAL_TONES)[number];

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
export type Theme = (typeof THEMES)[number];

export const AUDIENCES = ["mainstream", "niche"] as const;
export type Audience = (typeof AUDIENCES)[number];

export const ERAS = ["classic", "modern", "recent"] as const;
export type Era = (typeof ERAS)[number];

export const POPULARITIES = ["very_popular", "popular", "less_popular"] as const;
export type Popularity = (typeof POPULARITIES)[number];

/** watched/2 plus user_movie_rating/3. Rating is the personal score, 0–5. */
export type WatchedMovie = {
  movie_id: string;
  rating: number;
};

/** prefers/3 grouped by attribute. */
export type UserPreferences = {
  director: string[];
  writer: string[];
  star: string[];
  country_origin: string[];
  subgenre: string[];
  pace: Pace[];
  complexity: Level[];
  violence: Level[];
  humor: Level[];
  psychological_intensity: Level[];
  emotional_tone: EmotionalTone[];
  themes: Theme[];
  audience: Audience[];
  era: Era[];
  popularity: Popularity[];
};

/** user_limit/3. List columns are always present; a missing scalar means no limit. */
export type UserLimits = {
  allow_rewatch?: boolean;
  max_duration_minutes?: number;
  year_from?: number;
  year_to?: number;
  required_languages: string[];
  disliked_directors: string[];
  disliked_stars: string[];
  session_min_age?: number;
  min_rating?: number;
  rating_tolerance?: number;
  rating_required?: boolean;
};

export type User = {
  user_id: string;
  age?: number;
  watched: WatchedMovie[];
  wishlist: string[];
  likes_genre: string[];
  dislikes_genre: string[];
  likes_language: string[];
  dislikes_language: string[];
  prefers: UserPreferences;
  limits: UserLimits;
};

export function emptyPreferences(): UserPreferences {
  return {
    director: [],
    writer: [],
    star: [],
    country_origin: [],
    subgenre: [],
    pace: [],
    complexity: [],
    violence: [],
    humor: [],
    psychological_intensity: [],
    emotional_tone: [],
    themes: [],
    audience: [],
    era: [],
    popularity: [],
  };
}

export function emptyLimits(): UserLimits {
  return {
    required_languages: [],
    disliked_directors: [],
    disliked_stars: [],
  };
}

export function emptyUser(userId: string, age?: number): User {
  return {
    user_id: userId,
    ...(age !== undefined ? { age } : {}),
    watched: [],
    wishlist: [],
    likes_genre: [],
    dislikes_genre: [],
    likes_language: [],
    dislikes_language: [],
    prefers: emptyPreferences(),
    limits: emptyLimits(),
  };
}
