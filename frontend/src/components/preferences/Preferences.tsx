import { useState } from "react";
import { Divider, Stack } from "@mui/material";
import { useApp } from "../../context/AppContext";
import { useSave } from "../../hooks/useSave";
import { limitErrors, preferencesChanged, preferencesOf, type PreferenceFields } from "../../lib/preferences";
import SaveBar from "../common/SaveBar";
import GenresSection from "./GenresSection";
import LanguagesSection from "./LanguagesSection";
import TraitsSection from "./TraitsSection";
import MoodSection from "./MoodSection";
import LimitsSection from "./LimitsSection";

type Props = {
    autosave: boolean;
    onAutosaveChange: (autosave: boolean) => void;
};

const Preferences = ({ autosave, onAutosaveChange }: Props) => {
    const { currentUser, updateUser } = useApp();
    const [form, setForm] = useState<PreferenceFields>(() => preferencesOf(currentUser));

    const patch = (changes: Partial<PreferenceFields>) => setForm((current) => ({ ...current, ...changes }));

    const errors = limitErrors(form);
    const hasErrors = Object.keys(errors).length > 0;
    const dirty = preferencesChanged(form, currentUser);

    const { saving, error, remaining, save } = useSave(
        form,
        dirty && !hasErrors,
        () => updateUser(currentUser.user_id, { ...currentUser, ...form }),
        autosave,
        "Preferências guardadas"
    );

    return (
        <Stack sx={{ minHeight: "100%" }}>
            <Stack spacing={3} divider={<Divider flexItem />} sx={{ flex: 1, pb: 3 }}>
                <GenresSection form={form} patch={patch} />
                <LanguagesSection form={form} patch={patch} />
                <TraitsSection form={form} patch={patch} />
                <MoodSection form={form} patch={patch} />
                <LimitsSection form={form} errors={errors} userAge={currentUser.age} patch={patch} />
            </Stack>

            <SaveBar
                dirty={dirty}
                blocked={hasErrors ? "Corrige os limites assinalados para guardar" : undefined}
                saving={saving}
                error={error}
                remaining={remaining}
                autosave={autosave}
                onAutosaveChange={onAutosaveChange}
                onReset={() => setForm(preferencesOf(currentUser))}
                onSave={save}
            />
        </Stack>
    );
};

export default Preferences;
