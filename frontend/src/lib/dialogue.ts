import type { DialogueTerm } from "../types/Dialogue";
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

const OPTION_ICONS: Record<string, string> = {
    emocao: "💗",
    comedia: "😄",
    acao: "💥",
    misterio: "🔍",
    terror: "👻",
    ficcao_cientifica: "🚀",
    fantasia: "🐉",
};

export const optionLabel = (option: string) => OPTION_LABELS[option] ?? formatLabel(option);
export const optionIcon = (option: string): string | undefined => OPTION_ICONS[option];
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
