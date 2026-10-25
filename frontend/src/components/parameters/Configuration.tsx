import { useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import { useApp } from "../../context/AppContext";
import { loadDraft, useDraft } from "../../hooks/useDraft";
import { useSave } from "../../hooks/useSave";
import { limitErrors, preferencesChanged, preferencesOf, type PreferenceFields } from "../../lib/preferences";
import type { User } from "../../types/User";
import SaveBar from "../common/SaveBar";
import Movies, { moviesOf, type MovieFields } from "../movies/Movies";
import Preferences from "../preferences/Preferences";
import PeopleAndOrigins, { peopleOf, type PeopleFields } from "./PeopleAndOrigins";

export type ConfigTab = "preferences" | "movies" | "people-and-origins";

type Forms = { preferences: PreferenceFields; movies: MovieFields; people: PeopleFields };

const savedOf = (user: User): Forms => ({ preferences: preferencesOf(user), movies: moviesOf(user), people: peopleOf(user) });

type Props = {
    tab: ConfigTab;
    autosave: boolean;
    onAutosaveChange: (autosave: boolean) => void;
    // Abas com alterações por guardar, para a barra de abas as assinalar.
    onDirtyChange: (userId: string, tabs: ConfigTab[]) => void;
};

// As três abas de configuração guardam-se juntas: um só formulário, um só Guardar.
const Configuration = ({ tab, autosave, onAutosaveChange, onDirtyChange }: Props) => {
    const { currentUser, updateUser } = useApp();
    const [forms, setForms] = useState<Forms>(() => loadDraft<Forms>(currentUser.user_id) ?? savedOf(currentUser));

    const patch =
        <K extends keyof Forms>(name: K) =>
        (changes: Partial<Forms[K]>) =>
            setForms((current) => ({ ...current, [name]: { ...current[name], ...changes } }));

    const saved = savedOf(currentUser);
    const changed: Record<ConfigTab, boolean> = {
        preferences: preferencesChanged(forms.preferences, currentUser),
        movies: JSON.stringify(forms.movies) !== JSON.stringify(saved.movies),
        "people-and-origins": JSON.stringify(forms.people) !== JSON.stringify(saved.people),
    };
    const dirtyTabs = (Object.keys(changed) as ConfigTab[]).filter((name) => changed[name]);
    const dirty = dirtyTabs.length > 0;

    const errors = limitErrors(forms.preferences);
    const hasErrors = Object.keys(errors).length > 0;

    useDraft(currentUser.user_id, forms, dirty);
    useEffect(() => onDirtyChange(currentUser.user_id, dirtyTabs), [currentUser.user_id, dirtyTabs.join()]);

    const { saving, error, remaining, save } = useSave(
        forms,
        dirty && !hasErrors,
        () => updateUser(currentUser.user_id, { ...currentUser, ...forms.preferences, ...forms.movies, ...forms.people }),
        autosave,
        "Alterações guardadas"
    );

    return (
        <Stack sx={{ minHeight: "100%" }}>
            <Box sx={{ flex: 1 }}>
                {tab === "preferences" && (
                    <Preferences form={forms.preferences} errors={errors} userAge={currentUser.age} patch={patch("preferences")} />
                )}
                {tab === "movies" && <Movies form={forms.movies} patch={patch("movies")} />}
                {tab === "people-and-origins" && <PeopleAndOrigins form={forms.people} patch={patch("people")} />}
            </Box>

            <SaveBar
                dirty={dirty}
                blocked={hasErrors ? "Corrige os limites assinalados nas Preferências para guardar" : undefined}
                saving={saving}
                error={error}
                remaining={remaining}
                autosave={autosave}
                onAutosaveChange={onAutosaveChange}
                onReset={() => setForms(savedOf(currentUser))}
                onSave={save}
            />
        </Stack>
    );
};

export default Configuration;
