import { useEffect, useState } from "react";
import { runDialogue } from "../api/dialogue";
import type { EngineStatus } from "./useEngines";
import type { AnsweredQuestion, Dialogue, DialogueAnswers } from "../types/Dialogue";

const answersOf = (history: AnsweredQuestion[]): DialogueAnswers =>
    Object.fromEntries(history.map(({ key, answer }) => [key, answer]));

// A user's dialogue with the engine. Answers live outside (`answers`) so they survive tab
// changes. Only answers to questions the engine asked are kept: changing one drops the later
// ones, which may no longer apply. Refetches after each engine reload; idle while reloading.
export function useDialogue(
    userId: string,
    answers: DialogueAnswers,
    setAnswers: (answers: DialogueAnswers) => void,
    reload: EngineStatus
) {
    const [dialogue, setDialogue] = useState<Dialogue | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setError(null);
        setLoading(true);
        if (reload.reloading) return;

        const controller = new AbortController();
        runDialogue(userId, answers, controller.signal)
            .then(setDialogue)
            .catch((err: Error) => {
                if (err.name === "AbortError") return;
                setError(err.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [userId, answers, reload.reloading, reload.version]);

    const history = dialogue?.history ?? [];

    return {
        dialogue,
        loading,
        error,
        answer: (key: string, value: string) => setAnswers({ ...answersOf(history), [key]: value }),
        // Go back to history question `index`, dropping its answer and later ones.
        revise: (index: number) => setAnswers(answersOf(history.slice(0, index))),
        restart: () => setAnswers({}),
    };
}
