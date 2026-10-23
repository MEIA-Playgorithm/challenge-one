import type { Movie } from "../types/Movie";
import { csvFields } from "./csv";

function list(value: string) {
    return value ? value.split(",").map((item) => item.trim()) : [];
}

function optionalNumber(value: string) {
    return value ? Number(value.replace(",", ".")) : null;
}

// Prolog sends the IMDb rating as CSV text ("8,2"); Drools sends a number.
export const imdbRating = (value: number | string | null) => {
    const rating = typeof value === "number" ? value : optionalNumber(value ?? "");
    return rating !== null && Number.isFinite(rating) ? rating : null;
};

// Distinct values of an attribute across the catalog, sorted. Engines match exact names,
// so only names that exist in the movies can be picked.
export const catalogValues = (movies: Movie[], key: "director" | "writer" | "star" | "country_origin") =>
    [...new Set(movies.flatMap((movie) => movie[key]))].sort((a, b) => a.localeCompare(b));

// Converte o conteúdo de knowledge_base/movies.csv em filmes, ordenados por título.
export function parseMoviesCsv(csv: string): Movie[] {
    const [header, ...rows] = csv.trim().split(/\r?\n/);
    const columns = csvFields(header);
    const movies = rows.map((row) => {
        const values = Object.fromEntries(csvFields(row).map((value, index) => [columns[index], value]));
        return {
            id: values.id,
            title: values.title,
            year: optionalNumber(values.year),
            duration: values.duration,
            rating_imdb: optionalNumber(values.rating_imdb),
            genre: list(values.genre),
            director: list(values.director),
            writer: list(values.writer),
            star: list(values.star),
            country_origin: list(values.country_origin),
            language: list(values.language),
        };
    });
    return movies.sort((a, b) => a.title.localeCompare(b.title));
}
