import { config } from "../lib/config";
import { parseMoviesCsv } from "../lib/movies";
import { request } from "./request";

export async function getMovies() {
    const response = await request({ label: "Knowledge base", baseUrl: config.knowledgeBaseUrl }, "/movies.csv");
    return parseMoviesCsv(await response.text());
}
