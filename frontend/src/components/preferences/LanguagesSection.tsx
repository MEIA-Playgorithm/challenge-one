import { Autocomplete, TextField } from "@mui/material";
import { LANGUAGES } from "../../lib/options";
import type { PreferenceFields } from "../../lib/preferences";
import { withValues } from "../../lib/utils";
import PreferenceSection from "../common/PreferenceSection";
import SentimentSelector from "../common/SentimentSelector";

type Props = {
    form: PreferenceFields;
    patch: (changes: Partial<PreferenceFields>) => void;
};

const LanguagesSection = ({ form, patch }: Props) => {
    return (
        <PreferenceSection
            title="Languages"
            description="Liked languages add to the score and disliked ones exclude a movie. Required languages are a hard filter."
        >
            <SentimentSelector
                label="Spoken languages"
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
                options={withValues(LANGUAGES, form.required_languages).filter(
                    (language) => !form.disliked_languages.includes(language)
                )}
                value={form.required_languages}
                onChange={(_, value) => patch({ required_languages: value })}
                slotProps={{ chip: { size: "small" } }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Required languages"
                        placeholder={form.required_languages.length ? "" : "Any"}
                        helperText="Movies must be in at least one of these"
                    />
                )}
            />
        </PreferenceSection>
    );
};

export default LanguagesSection;
