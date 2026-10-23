import { useEffect, useState } from "react";
import { runDialogue } from "../api/dialogue";
import type { EngineStatus } from "./useEngines";
import type { AnsweredQuestion, Dialogue, DialogueAnswers } from "../types/Dialogue";

const answersOf = (history: AnsweredQuestion[]): DialogueAnswers =>
    Object.fromEntries(history.map(({ key, answer }) => [key, answer]));

// O diálogo de um utilizador com o motor Prolog. As respostas vêm de fora (`answers`), para
// não se perderem ao mudar de separador. Só se guardam as respostas às perguntas que o motor
// fez: mudar uma resposta esquece as seguintes, que podiam já não se aplicar.
// Volta a pedir depois de cada reload do motor; enquanto recarrega não pede nada.
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
        // Volta à pergunta `index` do histórico, sem a sua resposta nem as seguintes.
        revise: (index: number) => setAnswers(answersOf(history.slice(0, index))),
        restart: () => setAnswers({}),
    };
}
