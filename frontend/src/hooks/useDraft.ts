import { useEffect } from "react";

// Alterações por guardar de cada formulário (por utilizador e aba). Ficam aqui, fora dos
// componentes, para não se perderem ao mudar de aba ou de utilizador.
const drafts = new Map<string, unknown>();

export const loadDraft = <T>(key: string) => drafts.get(key) as T | undefined;

// Guarda o formulário enquanto tiver alterações por guardar e esquece-o quando deixa de ter.
export function useDraft(key: string, form: unknown, dirty: boolean) {
    useEffect(() => {
        if (dirty) drafts.set(key, form);
        else drafts.delete(key);
    }, [key, form, dirty]);
}
