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
            title="Géneros"
            description="Os géneros de que gostas pesam mais e os de que não gostas excluem um filme. Clica num género para gostar, não gostar ou limpar."
        >
            <SentimentSelector
                label="Géneros principais"
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
                        label="Subgéneros preferidos"
                        placeholder={form.preferred_subgenres.length ? "" : "Any"}
                        helperText="Correspondências mais finas além dos géneros"
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
                        label="Subgéneros de que não gostas"
                        placeholder={dislikedSubgenres.length ? "" : "Nenhum"}
                        helperText="Exclui qualquer filme com estes subgéneros"
                    />
                )}
            />
        </PreferenceSection>
    );
};

export default GenresSection;
