import type { DialogueConclusion, DialoguePick, DialogueQuestion, DialogueTerm } from "../types/Dialogue";
import type { Recommendation } from "../types/Recommendation";
import { formatLabel } from "./utils";

// Options come from the engine without accents; this only picks how they display.
// The engine asks in Portuguese, so answers are Portuguese too.
const OPTION_LABELS: Record<string, string> = {
    sim: "Sim",
    nao: "Não",
    emocao: "Emoção",
    comedia: "Comédia",
    acao: "Ação",
    misterio: "Mistério",
    terror: "Terror",
    ficcao_cientifica: "Ficção científica",
    fantasia: "Fantasia",
};

export const optionLabel = (option: string) => OPTION_LABELS[option] ?? formatLabel(option);
export const isYesNo = (options: string[]) => options.length === 2 && options.includes("sim") && options.includes("nao");

const TONES: Record<string, string> = { triste: "um tom triste" };
const SESSION_PREFERENCES: Record<string, string> = { sobrenatural: "elementos sobrenaturais" };

// A dialogue fact in words, for lists ("Sugerir: Comédia"). Yes/no questions use their text
// when known (`questions`: key -> text). Anything else stays as the raw term.
export function describe(term: DialogueTerm, questions: Record<string, string> = {}): string {
    const [user, value] = term.args;
    switch (term.name) {
        case "user":
            return `${user} é um utilizador conhecido`;
        case "utilizador_atual":
            return `${user} está a escolher o filme`;
        case "escolha":
        case "experiencia_sessao":
            return value ? `Experiência: ${optionLabel(value)}` : "Experiência: a que escolheres";
        case "perfil_sessao":
            return "Ambiente: uma história que te emocione";
        case "sugerir_genero":
            return `Sugerir: ${formatLabel(value ?? "")}`;
        case "sugerir_tom":
            return `Sugerir: ${TONES[value ?? ""] ?? formatLabel(value ?? "")}`;
        case "preferencia_sessao":
            return `Preferir: ${SESSION_PREFERENCES[value ?? ""] ?? formatLabel(value ?? "")}`;
    }
    const question = questions[term.name];
    return question ? `Respondeste sim a “${question}”` : term.text;
}

// What a suggestion means for a movie (DialoguePick.matches).
export const matchLabel = ({ type, value }: { type: string; value: string }) =>
    type === "genre" ? formatLabel(value) : `${type === "themes" ? "Tema" : "Tom"}: ${formatLabel(value)}`;


// The facts a question's rule concludes if it is answered yes. Prolog sends them as terms;
// Drools only says them in the last line of its text, e.g. DialogueConclusion(type == "x", value == "y").
export function concludes({ why }: DialogueQuestion): DialogueTerm[] {
    if (!Array.isArray(why)) return why.concludes;
    const found = why[why.length - 1].match(/DialogueConclusion\(type == "(\w+)", value == "([^"]+)"\)/);
    return found ? [{ name: found[1], args: [null, found[2]], text: `${found[1]}(${found[2]})` }] : [];
}

// Same order as Prolog sorts a pick's matches: by type and then by value.
const byTerm = (a: DialoguePick["matches"][number], b: DialoguePick["matches"][number]) =>
    a.type === b.type ? (a.value < b.value ? -1 : 1) : a.type < b.type ? -1 : 1;

// The picks the Prolog dialogue returns, for an engine that does not: the user's recommendations
// that match the suggestions, most matches first and then in recommendation order.
export function sessionPicks(recommendations: Recommendation[], conclusions: DialogueConclusion[]): DialoguePick[] {
    const suggested = (name: string) => conclusions.filter(({ fact }) => fact.name === name).map(({ fact }) => fact.args[1]);
    const genres = suggested("sugerir_genero");
    const sad = suggested("sugerir_tom").includes("triste");
    const supernatural = suggested("preferencia_sessao").includes("sobrenatural");

    return recommendations
        .map(({ movie, score, status }) => {
            const matches: DialoguePick["matches"] = [
                ...movie.genre.filter((genre) => genres.includes(genre)).map((value) => ({ type: "genre" as const, value })),
                ...(sad && movie.emotional_tone.includes("sad") ? [{ type: "emotional_tone" as const, value: "sad" }] : []),
                ...(supernatural && movie.themes.includes("supernatural") ? [{ type: "themes" as const, value: "supernatural" }] : []),
            ];
            return { movie, score, status, matches: matches.sort(byTerm) };
        })
        .filter(({ matches }) => matches.length > 0)
        .sort((a, b) => b.matches.length - a.matches.length)
        .slice(0, 12);
}
