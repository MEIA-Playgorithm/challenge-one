import { Stack } from "@mui/material";
import { AUDIENCES, ERAS, LEVELS, PACES, POPULARITIES } from "../../types/User";
import type { PreferenceFields } from "../../lib/preferences";
import PreferenceSection from "../common/PreferenceSection";
import ChoiceGroup from "../common/ChoiceGroup";

type Props = {
    form: PreferenceFields;
    patch: (changes: Partial<PreferenceFields>) => void;
};

const TraitsSection = ({ form, patch }: Props) => {
    return (
        <PreferenceSection title="Características do filme" description="Escolhe todos os valores que te servem. Deixa uma linha vazia para não ter preferência.">
            <Stack spacing={1.5}>
                <ChoiceGroup label="Ritmo" options={PACES} value={form.preferred_pace} onChange={(value) => patch({ preferred_pace: value })} />
                <ChoiceGroup
                    label="Complexidade"
                    options={LEVELS}
                    value={form.preferred_complexity}
                    onChange={(value) => patch({ preferred_complexity: value })}
                />
                <ChoiceGroup
                    label="Violência"
                    options={LEVELS}
                    value={form.preferred_violence}
                    onChange={(value) => patch({ preferred_violence: value })}
                />
                <ChoiceGroup label="Humor" options={LEVELS} value={form.preferred_humor} onChange={(value) => patch({ preferred_humor: value })} />
                <ChoiceGroup
                    label="Intensidade psicológica"
                    options={LEVELS}
                    value={form.preferred_psychological_intensity}
                    onChange={(value) => patch({ preferred_psychological_intensity: value })}
                />
            </Stack>
            <Stack spacing={1.5}>
                <ChoiceGroup
                    label="Público"
                    options={AUDIENCES}
                    value={form.preferred_audience}
                    onChange={(value) => patch({ preferred_audience: value })}
                />
                <ChoiceGroup label="Época" options={ERAS} value={form.preferred_eras} onChange={(value) => patch({ preferred_eras: value })} />
                <ChoiceGroup
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
