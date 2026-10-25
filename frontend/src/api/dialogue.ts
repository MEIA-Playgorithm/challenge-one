import { config, type EngineId } from "../lib/config";
import { sessionPicks } from "../lib/dialogue";
import { imdbRating } from "../lib/movies";
import type { Dialogue, DialogueAnswers, DialogueQuestion } from "../types/Dialogue";
import { getUserRecommendations } from "./recommendations";
import { request } from "./request";
import { dialogueRoutes } from "./routes";

// The engines keep no dialogue state: each request sends every answer so far and gets back
// the next question (or null) and the conclusions.
async function post(engine: EngineId, userId: string, answers: DialogueAnswers, signal?: AbortSignal) {
    const response = await request(config.engines[engine], dialogueRoutes[engine], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, answers }),
        signal,
    });
    return response.json();
}

async function runPrologDialogue(userId: string, answers: DialogueAnswers, signal?: AbortSignal) {
    const dialogue = (await post("prolog", userId, answers, signal)) as Dialogue;
    return {
        ...dialogue,
        picks: dialogue.picks.map((pick) => ({ ...pick, movie: { ...pick.movie, rating_imdb: imdbRating(pick.movie.rating_imdb) } })),
    };
}

type DroolsDialogue = {
    question: DialogueQuestion | null;
    conclusions: { type: string; value: string; rule: string; how: string[] }[];
};

// Drools only returns the pending question, so each answered question is asked again,
// with the answers given before it, to get its text and its "why".
async function runDroolsDialogue(userId: string, answers: DialogueAnswers, signal?: AbortSignal): Promise<Dialogue> {
    const given = Object.entries(answers);
    const [end, ...earlier]: DroolsDialogue[] = await Promise.all([
        post("drools", userId, answers, signal),
        ...given.map((_, index) => post("drools", userId, Object.fromEntries(given.slice(0, index)), signal)),
    ]);
    const conclusions = end.conclusions.map(({ type, value, rule, how }) => ({
        fact: { text: `${type} ${value}`, name: type, args: [userId, value] },
        rule,
        premises: [],
        how,
    }));
    // Drools has no picks: they are worked out from its recommendations, as Prolog does.
    const recommendations = await getUserRecommendations("drools", userId, signal, 100);
    return {
        user_id: userId,
        history: given.map(([, answer], index) => ({ ...earlier[index].question!, answer })),
        question: end.question,
        conclusions,
        picks: sessionPicks(recommendations, conclusions),
    };
}

export const runDialogue = (engine: EngineId, userId: string, answers: DialogueAnswers, signal?: AbortSignal) =>
    engine === "prolog" ? runPrologDialogue(userId, answers, signal) : runDroolsDialogue(userId, answers, signal);
