import { useState } from "react";
import { Autocomplete, Divider, Stack, TextField } from "@mui/material";
import { useApp } from "../context/AppContext";
import { useSave } from "../hooks/useSave";
import type { User } from "../types/User";
import { MOVIES, MOVIES_BY_ID } from "../mocks/movies";
import { withValues } from "../lib/utils";
import PreferenceSection from "./PreferenceSection";
import WatchedMovieRow from "./WatchedMovieRow";
import SaveBar from "./SaveBar";

type MovieFields = Pick<User, "watched" | "wishlist">;

const MOVIE_IDS = MOVIES.map((movie) => movie.id);

const fromUser = ({ watched, wishlist }: User): MovieFields => ({ watched, wishlist });

const movieLabel = (id: string) => {
    const movie = MOVIES_BY_ID.get(id);
    if (!movie) return id;
    return movie.year === null ? movie.title : `${movie.title} (${movie.year})`;
};

type Props = {
    autosave: boolean;
    onAutosaveChange: (autosave: boolean) => void;
};

const Movies = ({ autosave, onAutosaveChange }: Props) => {
    const { currentUser, updateUser } = useApp();
    const [form, setForm] = useState<MovieFields>(() => fromUser(currentUser));

    const patch = (changes: Partial<MovieFields>) => setForm((current) => ({ ...current, ...changes }));

    const dirty = JSON.stringify(form) !== JSON.stringify(fromUser(currentUser));
    const watchedIds = new Set(form.watched.map((item) => item.movie_id));
    const blockedWishes = currentUser.allow_rewatch ? [] : form.wishlist.filter((id) => watchedIds.has(id));

    const wishlistHint = blockedWishes.length
        ? `Already watched, so not recommended until rewatching is allowed: ${blockedWishes.map(movieLabel).join(", ")}`
        : undefined;

    const { saving, error, remaining, save } = useSave(
        form,
        dirty,
        () => updateUser(currentUser.user_id, { ...currentUser, ...form }),
        autosave,
        "Movies saved"
    );

    return (
        <Stack sx={{ minHeight: "100%" }}>
            <Stack spacing={3} divider={<Divider flexItem />} sx={{ flex: 1, pb: 3 }}>
                <PreferenceSection
                    title="Watched"
                    description="Ratings of 4 or 5 boost similar movies. Watched movies are skipped unless rewatching is allowed."
                >
                    <Autocomplete
                        size="small"
                        blurOnSelect
                        options={MOVIE_IDS.filter((id) => !watchedIds.has(id))}
                        value={null}
                        onChange={(_, id) => {
                            if (id) patch({ watched: [...form.watched, { movie_id: id, rating: 0 }] });
                        }}
                        getOptionLabel={movieLabel}
                        renderInput={(params) => (
                            <TextField {...params} label="Add a watched movie" placeholder="Search by title" />
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

                <PreferenceSection title="Wishlist" description="Each movie here adds to its score.">
                    <Autocomplete
                        multiple
                        size="small"
                        filterSelectedOptions
                        options={withValues(MOVIE_IDS, form.wishlist)}
                        value={form.wishlist}
                        onChange={(_, value) => patch({ wishlist: value })}
                        getOptionLabel={movieLabel}
                        slotProps={{ chip: { size: "small", color: "primary" } }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Want to see"
                                placeholder={form.wishlist.length ? "" : "None"}
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
