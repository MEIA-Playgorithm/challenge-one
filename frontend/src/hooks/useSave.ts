import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Tempo sem alterações antes de gravar: dá tempo para continuar a editar e para cancelar.
export const AUTOSAVE_DELAY_MS = 5000;

// Gravação de um formulário, à mão ou automática. `canSave` diz se há algo válido para
// gravar; `write` devolve uma mensagem de erro, ou null se correu bem.
export function useSave(form: unknown, canSave: boolean, write: () => Promise<string | null>, autosave: boolean, message: string) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Milissegundos que faltam para a gravação automática; null quando não está agendada.
    const [remaining, setRemaining] = useState<number | null>(null);
    // O formulário que a gravação já tentou gravar: nunca o repete, mesmo que o que volta
    // do servidor seja diferente do que enviámos (evita gravar em ciclo).
    const lastSaved = useRef<unknown>(null);

    const run = async () => {
        lastSaved.current = form;
        setSaving(true);
        const failure = await write();
        setError(failure);
        setSaving(false);
        return failure;
    };

    const save = async () => {
        if (!(await run())) toast.success(message);
    };

    // Uma alteração nova apaga o erro anterior, para a gravação automática voltar a tentar.
    useEffect(() => setError(null), [form]);

    const due = autosave && canSave && !saving && !error && form !== lastSaved.current;

    // Cada alteração reinicia a contagem. Se houver alterações durante a gravação, `canSave`
    // volta a ser verdadeiro no fim e a contagem recomeça: uma gravação de cada vez.
    useEffect(() => {
        if (!due) {
            setRemaining(null);
            return;
        }
        const deadline = Date.now() + AUTOSAVE_DELAY_MS;
        setRemaining(AUTOSAVE_DELAY_MS);
        const timer = setInterval(() => {
            const left = deadline - Date.now();
            if (left > 0) return setRemaining(left);
            clearInterval(timer);
            setRemaining(null);
            run();
        }, 100);
        return () => clearInterval(timer);
    }, [due, form]);

    return { saving, error, remaining, save };
}
