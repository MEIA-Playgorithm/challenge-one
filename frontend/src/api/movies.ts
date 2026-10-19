import { config } from "../lib/config";
import { parseMoviesCsv } from "../lib/movies";
import { request } from "./request";
import { knowledgeBaseRoutes } from "./routes";

export async function getMovies() {
    const response = await request({ label: "Knowledge base", baseUrl: config.knowledgeBaseUrl }, knowledgeBaseRoutes.moviesCsv);
    return parseMoviesCsv(await response.text());
}
