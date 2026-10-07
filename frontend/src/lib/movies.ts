import type { Movie } from "../types/Movie";

export function text(value: string | number | null | undefined) {
  if (value == null || value === "") return "";
  return String(value);
}

export function durationText(value: string | number | null | undefined) {
  if (value == null || value === "") return "";
  return typeof value === "number" ? `${value} min` : String(value);
}

export function movieHeading(movie: Movie) {
  const rating = text(movie.rating_imdb);
  return [text(movie.year), rating && `IMDb ${rating}`].filter(Boolean).join(" · ");
}

export function movieMeta(movie: Movie) {
  return [movie.director?.join(", "), movie.language?.join(", "), durationText(movie.duration), movie.country_origin?.join(", ")]
    .filter((part) => part)
    .join(" · ");
}
