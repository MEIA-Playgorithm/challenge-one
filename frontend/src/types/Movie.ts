export type Movie = {
  id: string;
  title: string;
  year: number;
  genres: string[];
  language: string;
  director: string;
  actors: string[];
  writers: string[];
  productionCompany: string;
  country: string;
  rating: number;
  duration?: number;
};

export type PreferenceStatus = "liked" | "disliked" | "want_to_see" | "skip";

export const PREFERENCE_STATUS_LABELS: Record<PreferenceStatus, string> = {
  liked: "Liked",
  disliked: "Disliked",
  want_to_see: "Want to see",
  skip: "Don't want",
};
