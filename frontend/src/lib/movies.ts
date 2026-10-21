import type { Movie } from "../types/Movie";

function fields(row: string) {
    const cells = [""];
    let quoted = false;
    for (const char of row) {
        if (char === '"') quoted = !quoted;
        else if (char === "," && !quoted) cells.push("");
        else cells[cells.length - 1] += char;
    }
    return cells;
}

function list(value: string) {
    return value ? value.split(",").map((item) => item.trim()) : [];
}

function optionalNumber(value: string) {
    return value ? Number(value.replace(",", ".")) : null;
}

// Converte o conteúdo de knowledge_base/movies.csv em filmes, ordenados por título.
export function parseMoviesCsv(csv: string): Movie[] {
    const [header, ...rows] = csv.trim().split(/\r?\n/);
    const columns = fields(header);
    const movies = rows.map((row) => {
        const values = Object.fromEntries(fields(row).map((value, index) => [columns[index], value]));
        return {
            id: values.id,
            title: values.title,
            year: optionalNumber(values.year),
            duration: values.duration,
            rating_imdb: optionalNumber(values.rating_imdb),
            genre: list(values.genre),
            director: list(values.director),
            star: list(values.star),
            language: list(values.language),
        };
    });
    return movies.sort((a, b) => a.title.localeCompare(b.title));
}
