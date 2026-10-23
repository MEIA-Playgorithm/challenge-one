import { useState } from "react";
import { Autocomplete, Divider, Stack, TextField } from "@mui/material";
import { useApp } from "../../context/AppContext";
import { useSave } from "../../hooks/useSave";
import type { User } from "../../types/User";
import { withValues } from "../../lib/utils";
import PreferenceSection from "../common/PreferenceSection";
import WatchedMovieRow from "./WatchedMovieRow";
import SaveBar from "../common/SaveBar";

type MovieFields = Pick<User, "watched" | "wishlist">;

const fromUser = ({ watched, wishlist }: User): MovieFields => ({ watched, wishlist });

type Props = {
    autosave: boolean;
    onAutosaveChange: (autosave: boolean) => void;
};

const Movies = ({ autosave, onAutosaveChange }: Props) => {
    const { currentUser, updateUser, movies, movieById } = useApp();
    const movieIds = movies.map((movie) => movie.id);
    const movieLabel = (id: string) => {
        const movie = movieById.get(id);
        if (!movie) return id;
        return movie.year === null ? movie.title : `${movie.title} (${movie.year})`;
    };
    const [form, setForm] = useState<MovieFields>(() => fromUser(currentUser));

    const patch = (changes: Partial<MovieFields>) => setForm((current) => ({ ...current, ...changes }));

    const dirty = JSON.stringify(form) !== JSON.stringify(fromUser(currentUser));
    const watchedIds = new Set(form.watched.map((item) => item.movie_id));
    const blockedWishes = currentUser.allow_rewatch ? [] : form.wishlist.filter((id) => watchedIds.has(id));

    const wishlistHint = blockedWishes.length
        ? `Já vistos, por isso não são recomendados até permitires rever: ${blockedWishes.map(movieLabel).join(", ")}`
        : undefined;

    const { saving, error, remaining, save } = useSave(
        form,
        dirty,
        () => updateUser(currentUser.user_id, { ...currentUser, ...form }),
        autosave,
        "Filmes guardados"
    );

    return (
        <Stack sx={{ minHeight: "100%" }}>
            <Stack spacing={3} divider={<Divider flexItem />} sx={{ flex: 1, pb: 3 }}>
                <PreferenceSection
                    title="Vistos"
                    description="Notas de 4 ou 5 favorecem filmes semelhantes. Os filmes vistos são ignorados, a não ser que permitas rever."
                >
                    <Autocomplete
                        size="small"
                        blurOnSelect
                        options={movieIds.filter((id) => !watchedIds.has(id))}
                        value={null}
                        onChange={(_, id) => {
                            if (id) patch({ watched: [...form.watched, { movie_id: id, rating: 0 }] });
                        }}
                        getOptionLabel={movieLabel}
                        renderInput={(params) => (
                            <TextField {...params} label="Adicionar um filme visto" placeholder="Pesquisar por título" />
                        )}
                    />
                    <Stack spacing={1.5}>
                        {form.watched.map((item) => (
                            <WatchedMovieRow
                                key={item.movie_id}
                                item={item}
                                onRate={(rating) =>
                                    patch({ watched: form.watched.map((entry) => (entry === item ? { ...item, rating } : entry)) })
                                }
                                onRemove={() => patch({ watched: form.watched.filter((entry) => entry !== item) })}
                            />
                        ))}
                    </Stack>
                </PreferenceSection>

                <PreferenceSection title="Lista de desejos" description="Cada filme aqui recebe mais pontos.">
                    <Autocomplete
                        multiple
                        size="small"
                        filterSelectedOptions
                        options={withValues(movieIds, form.wishlist)}
                        value={form.wishlist}
                        onChange={(_, value) => patch({ wishlist: value })}
                        getOptionLabel={movieLabel}
                        slotProps={{ chip: { size: "small", color: "primary" } }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Quero ver"
                                placeholder={form.wishlist.length ? "" : "Nenhum"}
                                helperText={wishlistHint}
                            />
                        )}
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

export default Movies;
