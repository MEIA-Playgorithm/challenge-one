import { Autocomplete, TextField } from "@mui/material";
import { LANGUAGES } from "../../lib/options";
import type { PreferenceFields } from "../../lib/preferences";
import { formatLabel, withValues } from "../../lib/utils";
import PreferenceSection from "../common/PreferenceSection";
import SentimentSelector from "../common/SentimentSelector";

type Props = {
    form: PreferenceFields;
    patch: (changes: Partial<PreferenceFields>) => void;
};

const LanguagesSection = ({ form, patch }: Props) => {
    return (
        <PreferenceSection
            title="Idiomas"
            description="Os idiomas de que gostas somam pontos e os de que não gostas excluem um filme. Os idiomas obrigatórios são um filtro estrito."
        >
            <SentimentSelector
                label="Idiomas falados"
                options={LANGUAGES}
                liked={form.preferred_languages}
                disliked={form.disliked_languages}
                onChange={(liked, disliked) =>
                    patch({
                        preferred_languages: liked,
                        disliked_languages: disliked,
                        required_languages: form.required_languages.filter((language) => !disliked.includes(language)),
                    })
                }
            />
            <Autocomplete
                multiple
                size="small"
                filterSelectedOptions
                getOptionLabel={formatLabel}
                options={withValues(LANGUAGES, form.required_languages).filter(
                    (language) => !form.disliked_languages.includes(language)
                )}
                value={form.required_languages}
                onChange={(_, value) => patch({ required_languages: value })}
                slotProps={{ chip: { size: "small" } }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Idiomas obrigatórios"
                        placeholder={form.required_languages.length ? "" : "Any"}
                        helperText="Os filmes têm de estar em pelo menos um destes"
                    />
                )}
            />
        </PreferenceSection>
    );
};

export default LanguagesSection;
