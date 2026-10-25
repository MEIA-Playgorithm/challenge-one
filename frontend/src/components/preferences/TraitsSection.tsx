import { Stack } from "@mui/material";
import { AUDIENCES, ERAS, LEVELS, PACES, POPULARITIES } from "../../types/User";
import type { PreferenceFields } from "../../lib/preferences";
import PreferenceSection from "../common/PreferenceSection";
import ChoiceChips from "../common/ChoiceChips";

type Props = {
    form: PreferenceFields;
    patch: (changes: Partial<PreferenceFields>) => void;
};

const TraitsSection = ({ form, patch }: Props) => {
    return (
        <PreferenceSection title="Características do filme" description="Escolhe todos os valores que te servem. Deixa uma linha vazia para não ter preferência.">
            <Stack spacing={1.5}>
                <ChoiceChips inline label="Ritmo" options={PACES} value={form.preferred_pace} onChange={(value) => patch({ preferred_pace: value })} />
                <ChoiceChips inline
                    label="Complexidade"
                    options={LEVELS}
                    value={form.preferred_complexity}
                    onChange={(value) => patch({ preferred_complexity: value })}
                />
                <ChoiceChips inline
                    label="Violência"
                    options={LEVELS}
                    value={form.preferred_violence}
                    onChange={(value) => patch({ preferred_violence: value })}
                />
                <ChoiceChips inline label="Humor" options={LEVELS} value={form.preferred_humor} onChange={(value) => patch({ preferred_humor: value })} />
                <ChoiceChips inline
                    label="Intensidade psicológica"
                    options={LEVELS}
                    value={form.preferred_psychological_intensity}
                    onChange={(value) => patch({ preferred_psychological_intensity: value })}
                />
            </Stack>
            <Stack spacing={1.5}>
                <ChoiceChips inline
                    label="Público"
                    options={AUDIENCES}
                    value={form.preferred_audience}
                    onChange={(value) => patch({ preferred_audience: value })}
                />
                <ChoiceChips inline label="Época" options={ERAS} value={form.preferred_eras} onChange={(value) => patch({ preferred_eras: value })} />
                <ChoiceChips inline
                    label="Popularidade"
                    options={POPULARITIES}
                    value={form.preferred_popularity}
                    onChange={(value) => patch({ preferred_popularity: value })}
                />
            </Stack>
        </PreferenceSection>
    );
};

export default TraitsSection;
