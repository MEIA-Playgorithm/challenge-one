import { useMemo, useState } from "react";
import { Autocomplete, Divider, Stack, TextField } from "@mui/material";
import { useApp } from "../../context/AppContext";
import { useSave } from "../../hooks/useSave";
import { catalogValues } from "../../lib/movies";
import { withValues } from "../../lib/utils";
import type { User } from "../../types/User";
import PreferenceSection from "../common/PreferenceSection";
import SaveBar from "../common/SaveBar";

type PeopleFields = Pick<
    User,
    "preferred_directors" | "disliked_directors" | "preferred_stars" | "disliked_stars" | "preferred_writers" | "preferred_countries"
>;

const fromUser = (user: User): PeopleFields => ({
    preferred_directors: user.preferred_directors,
    disliked_directors: user.disliked_directors,
    preferred_stars: user.preferred_stars,
    disliked_stars: user.disliked_stars,
    preferred_writers: user.preferred_writers,
    preferred_countries: user.preferred_countries,
});

type NamePickerProps = {
    label: string;
    helperText: string;
    options: string[];
    value: string[];
    disliked?: boolean;
    onChange: (value: string[]) => void;
};

// Catalog names; saved values still show even if no movie has them anymore.
const NamePicker = ({ label, helperText, options, value, disliked = false, onChange }: NamePickerProps) => (
    <Autocomplete
        multiple
        size="small"
        filterSelectedOptions
        options={withValues(options, value)}
        value={value}
        onChange={(_, next) => onChange(next)}
        slotProps={{ chip: disliked ? { size: "small", color: "error", variant: "outlined" } : { size: "small", color: "primary" } }}
        renderInput={(params) => (
            <TextField {...params} label={label} placeholder={value.length ? "" : disliked ? "Nenhum" : "Qualquer"} helperText={helperText} />
        )}
    />
);

type Props = {
    autosave: boolean;
    onAutosaveChange: (autosave: boolean) => void;
};

const PeopleAndOrigins = ({ autosave, onAutosaveChange }: Props) => {
    const { currentUser, updateUser, movies } = useApp();
    const [form, setForm] = useState<PeopleFields>(() => fromUser(currentUser));
    const options = useMemo(
        () => ({
            directors: catalogValues(movies, "director"),
            stars: catalogValues(movies, "star"),
            writers: catalogValues(movies, "writer"),
            countries: catalogValues(movies, "country_origin"),
        }),
        [movies]
    );

    const patch = (changes: Partial<PeopleFields>) => setForm((current) => ({ ...current, ...changes }));

    const dirty = JSON.stringify(form) !== JSON.stringify(fromUser(currentUser));

    const { saving, error, remaining, save } = useSave(
        form,
        dirty,
        () => updateUser(currentUser.user_id, { ...currentUser, ...form }),
        autosave,
        "Pessoas e origens guardadas"
    );

    // A name can't be both preferred and disliked: disliking removes it from preferred.
    const without = (values: string[], removed: string[]) => values.filter((value) => !removed.includes(value));

    return (
        <Stack sx={{ minHeight: "100%" }}>
            <Stack spacing={3} divider={<Divider flexItem />} sx={{ flex: 1, pb: 3 }}>
                <PreferenceSection
                    title="Realizadores"
                    description="Um realizador de que gostas soma pontos. Um de que não gostas exclui todos os filmes que realizou."
                >
                    <NamePicker
                        label="Realizadores de que gostas"
                        helperText="Os filmes realizados por qualquer um deles pontuam mais"
                        options={without(options.directors, form.disliked_directors)}
                        value={form.preferred_directors}
                        onChange={(value) => patch({ preferred_directors: value })}
                    />
                    <NamePicker
                        label="Realizadores de que não gostas"
                        helperText="Exclui os filmes deles"
                        options={options.directors}
                        value={form.disliked_directors}
                        disliked
                        onChange={(value) =>
                            patch({ disliked_directors: value, preferred_directors: without(form.preferred_directors, value) })
                        }
                    />
                </PreferenceSection>

                <PreferenceSection
                    title="Atores"
                    description="Um ator de que gostas soma pontos. Um de que não gostas exclui todos os filmes em que entra."
                >
                    <NamePicker
                        label="Atores de que gostas"
                        helperText="Os filmes com qualquer um deles pontuam mais"
                        options={without(options.stars, form.disliked_stars)}
                        value={form.preferred_stars}
                        onChange={(value) => patch({ preferred_stars: value })}
                    />
                    <NamePicker
                        label="Atores de que não gostas"
                        helperText="Exclui os filmes deles"
                        options={options.stars}
                        value={form.disliked_stars}
                        disliked
                        onChange={(value) => patch({ disliked_stars: value, preferred_stars: without(form.preferred_stars, value) })}
                    />
                </PreferenceSection>

                <PreferenceSection title="Argumentistas e origens" description="Bónus menores para quem escreveu a história e para o país de onde o filme vem.">
                    <NamePicker
                        label="Argumentistas de que gostas"
                        helperText="Um pequeno bónus para os filmes que escreveram"
                        options={options.writers}
                        value={form.preferred_writers}
                        onChange={(value) => patch({ preferred_writers: value })}
                    />
                    <NamePicker
                        label="Países de origem"
                        helperText="Um pequeno bónus para filmes feitos nestes países"
                        options={options.countries}
                        value={form.preferred_countries}
                        onChange={(value) => patch({ preferred_countries: value })}
                    />
                </PreferenceSection>
            </Stack>

            <SaveBar
                dirty={dirty}
                saving={saving}
                error={error}
                remaining={remaining}
                autosave={autosave}
                onAutosaveChange={onAutosaveChange}
                onReset={() => setForm(fromUser(currentUser))}
                onSave={save}
            />
        </Stack>
    );
};

export default PeopleAndOrigins;
