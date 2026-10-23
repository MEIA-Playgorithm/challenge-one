import { config } from "../lib/config";
import { imdbRating } from "../lib/movies";
import type { Dialogue, DialogueAnswers } from "../types/Dialogue";
import { request } from "./request";
import { prologDialogueRoute } from "./routes";

// O motor não guarda o diálogo: cada pedido leva todas as respostas dadas até agora e
// devolve as perguntas já respondidas, a próxima pergunta (ou null) e as conclusões.
export async function runDialogue(userId: string, answers: DialogueAnswers, signal?: AbortSignal) {
    const response = await request(config.engines.prolog, prologDialogueRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, answers }),
        signal,
    });
    const dialogue = (await response.json()) as Dialogue;
    return {
        ...dialogue,
        picks: dialogue.picks.map((pick) => ({ ...pick, movie: { ...pick.movie, rating_imdb: imdbRating(pick.movie.rating_imdb) } })),
    };
}
