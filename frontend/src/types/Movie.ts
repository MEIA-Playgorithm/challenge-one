export type MovieScalar = string | number | null;

export type MoviePace = "slow" | "medium" | "fast" | "unknown";
export type MovieLevel = "low" | "medium" | "high" | "unknown";
export type MovieAudience = "mainstream" | "niche" | "unknown";

/** One `/api/filmes` item: CSV predicates plus the classifications from rules_movies.pl. */
export type Movie = {
  id: string;
  title: string;
  year: MovieScalar;
  vote: MovieScalar;
  duration: MovieScalar;
  rating_mpa: MovieScalar;
  rating_imdb: MovieScalar;
  budget: MovieScalar;
  win: MovieScalar;
  nomination: MovieScalar;
  oscar: MovieScalar;
  pace: MoviePace | null;
  complexity: MovieLevel | null;
  violence: MovieLevel | null;
  humor: MovieLevel | null;
  audience: MovieAudience | null;
  psychological_intensity: MovieLevel | null;
  director: string[];
  writer: string[];
  star: string[];
  genre: string[];
  country_origin: string[];
  filming_location: string[];
  production_company: string[];
  language: string[];
  emotional_tone: string[];
  themes: string[];
  subgenre: string[];
};

export type PreferenceStatus = "liked" | "disliked" | "want_to_see" | "skip";

export const PREFERENCE_STATUS_LABELS: Record<PreferenceStatus, string> = {
  liked: "Liked",
  disliked: "Disliked",
  want_to_see: "Want to see",
  skip: "Don't want",
};
