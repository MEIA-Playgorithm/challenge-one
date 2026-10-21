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
        <PreferenceSection title="Movie traits" description="Pick every value that suits you. Leave a row empty for no preference.">
            <Stack spacing={1.5}>
                <ChoiceGroup label="Pace" options={PACES} value={form.preferred_pace} onChange={(value) => patch({ preferred_pace: value })} />
                <ChoiceGroup
                    label="Complexity"
                    options={LEVELS}
                    value={form.preferred_complexity}
                    onChange={(value) => patch({ preferred_complexity: value })}
                />
                <ChoiceGroup
                    label="Violence"
                    options={LEVELS}
                    value={form.preferred_violence}
                    onChange={(value) => patch({ preferred_violence: value })}
                />
                <ChoiceGroup label="Humor" options={LEVELS} value={form.preferred_humor} onChange={(value) => patch({ preferred_humor: value })} />
                <ChoiceGroup
                    label="Psychological intensity"
                    options={LEVELS}
                    value={form.preferred_psychological_intensity}
                    onChange={(value) => patch({ preferred_psychological_intensity: value })}
                />
            </Stack>
            <Stack spacing={1.5}>
                <ChoiceGroup
                    label="Audience"
                    options={AUDIENCES}
                    value={form.preferred_audience}
                    onChange={(value) => patch({ preferred_audience: value })}
                />
                <ChoiceGroup label="Era" options={ERAS} value={form.preferred_eras} onChange={(value) => patch({ preferred_eras: value })} />
                <ChoiceGroup
                    label="Popularity"
                    options={POPULARITIES}
                    value={form.preferred_popularity}
                    onChange={(value) => patch({ preferred_popularity: value })}
                />
            </Stack>
        </PreferenceSection>
    );
};

export default TraitsSection;
