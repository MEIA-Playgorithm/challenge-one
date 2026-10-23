import type { Movie } from "../types/Movie";
import { csvFields } from "./csv";

function list(value: string) {
    return value ? value.split(",").map((item) => item.trim()) : [];
}

function optionalNumber(value: string) {
    return value ? Number(value.replace(",", ".")) : null;
}

// O Prolog manda a nota IMDb como o texto do CSV ("8,2"); o Drools manda um número.
export const imdbRating = (value: number | string | null) => {
    const rating = typeof value === "number" ? value : optionalNumber(value ?? "");
    return rating !== null && Number.isFinite(rating) ? rating : null;
};

// Os valores distintos de um atributo em todo o catálogo, por ordem alfabética. Os motores
// comparam nomes exatos, por isso só se escolhem nomes que existem nos filmes.
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
