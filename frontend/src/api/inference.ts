import type { Movie } from "../types/Movie";
import { getJson } from "./client";

export type { Movie };

export type Reason = {
  type: string;
  value?: string | number;
  movie_id?: string;
};

export type Explanation = {
  type: string;
  arguments?: Array<string | number>;
};

export type ScoreBreakdown = {
  genre: number;
  rating: number;
  director: number;
  star: number;
  secondary: number;
};

export type UserRecommendation = {
  score: number;
  reasons: Reason[];
  movie: Movie;
  status: "main" | "alternative";
  satisfied_requirements: Explanation[];
  unmet_preferences: Explanation[];
  score_breakdown: ScoreBreakdown;
};

type UserRecommendationsResponse = {
  user_id: string;
  total: number;
  offset: number;
  limit: number;
  items: UserRecommendation[];
};

export type SimilarItem = {
  score: number;
  movie: Movie;
};

type SimilarResponse = {
  source_id: string;
  total: number;
  items: SimilarItem[];
};

type MoviesResponse = {
  total: number;
  offset: number;
  limit: number;
  items: Movie[];
};

export function listMovies(signal?: AbortSignal) {
  const params = new URLSearchParams({ limit: "100" });
  return getJson<MoviesResponse>(`/api/filmes?${params}`, signal);
}

export function health(signal?: AbortSignal) {
  return getJson<{ status: string }>("/api/health", signal);
}

export function userRecommendations(userId: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ user_id: userId, limit: "10" });
  return getJson<UserRecommendationsResponse>(`/api/recomendacoes_utilizador?${params}`, signal);
}

export function similarMovies(id: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ id, limit: "5" });
  return getJson<SimilarResponse>(`/api/recomendacoes?${params}`, signal);
}
