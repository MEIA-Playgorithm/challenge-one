import { Autocomplete, Stack, TextField } from "@mui/material";
import FadeLine from "../common/FadeLine";
import { useApp } from "../../context/AppContext";
import type { User } from "../../types/User";
import { withValues } from "../../lib/utils";
import PreferenceSection from "../common/PreferenceSection";
import WatchedMovieRow from "./WatchedMovieRow";

export type MovieFields = Pick<User, "watched" | "wishlist">;

export const moviesOf = ({ watched, wishlist }: User): MovieFields => ({ watched, wishlist });

type Props = {
    form: MovieFields;
    patch: (changes: Partial<MovieFields>) => void;
};

// O formulário vem de Configuration, que também guarda.
const Movies = ({ form, patch }: Props) => {
    const { currentUser, movies, movieById } = useApp();
    const movieIds = movies.map((movie) => movie.id);
    const movieLabel = (id: string) => {
        const movie = movieById.get(id);
        if (!movie) return id;
        return movie.year === null ? movie.title : `${movie.title} (${movie.year})`;
    };
    const watchedIds = new Set(form.watched.map((item) => item.movie_id));
    const blockedWishes = currentUser.allow_rewatch ? [] : form.wishlist.filter((id) => watchedIds.has(id));

    const wishlistHint = blockedWishes.length
        ? `Já vistos, por isso não são recomendados até permitires rever: ${blockedWishes.map(movieLabel).join(", ")}`
        : undefined;

    return (
        <Stack spacing={3} divider={<FadeLine />} sx={{ pb: 3 }}>
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
    );
};

export default Movies;
