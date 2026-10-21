import { Autocomplete, TextField } from "@mui/material";
import { GENRES, SUBGENRES } from "../../lib/options";
import type { PreferenceFields } from "../../lib/preferences";
import { formatLabel, withValues } from "../../lib/utils";
import PreferenceSection from "../common/PreferenceSection";
import SentimentSelector from "../common/SentimentSelector";

type Props = {
    form: PreferenceFields;
    patch: (changes: Partial<PreferenceFields>) => void;
};

const GenresSection = ({ form, patch }: Props) => {
    // Os géneros e os subgéneros que não gosta ficam na mesma lista (disliked_genres).
    const dislikedSubgenres = form.disliked_genres.filter((genre) => SUBGENRES.includes(genre));
    const dislikedMainGenres = form.disliked_genres.filter((genre) => !SUBGENRES.includes(genre));

    return (
        <PreferenceSection
            title="Genres"
            description="Liked genres weigh the most and disliked genres exclude a movie. Click a chip to like, dislike or clear it."
        >
            <SentimentSelector
                label="Main genres"
                options={GENRES}
                liked={form.preferred_genres}
                disliked={dislikedMainGenres}
                onChange={(liked, disliked) =>
                    patch({ preferred_genres: liked, disliked_genres: [...disliked, ...dislikedSubgenres] })
                }
            />
            <Autocomplete
                multiple
                size="small"
                filterSelectedOptions
                options={withValues(SUBGENRES, form.preferred_subgenres).filter((genre) => !dislikedSubgenres.includes(genre))}
                value={form.preferred_subgenres}
                onChange={(_, value) => patch({ preferred_subgenres: value })}
                getOptionLabel={formatLabel}
                slotProps={{ chip: { size: "small", color: "primary" } }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Preferred subgenres"
                        placeholder={form.preferred_subgenres.length ? "" : "Any"}
                        helperText="Finer matches on top of the genres"
                    />
                )}
            />
            <Autocomplete
                multiple
                size="small"
                filterSelectedOptions
                options={SUBGENRES}
                value={dislikedSubgenres}
                onChange={(_, value) =>
                    patch({
                        disliked_genres: [...dislikedMainGenres, ...value],
                        preferred_subgenres: form.preferred_subgenres.filter((genre) => !value.includes(genre)),
                    })
                }
                getOptionLabel={formatLabel}
                slotProps={{ chip: { size: "small", color: "error", variant: "outlined" } }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Disliked subgenres"
                        placeholder={dislikedSubgenres.length ? "" : "None"}
                        helperText="Excludes any movie tagged with these"
                    />
                )}
            />
        </PreferenceSection>
    );
};

export default GenresSection;
