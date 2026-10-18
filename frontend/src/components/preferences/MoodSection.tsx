import { EMOTIONAL_TONES, THEMES } from "../../types/User";
import type { PreferenceFields } from "../../lib/preferences";
import PreferenceSection from "../common/PreferenceSection";
import ChoiceChips from "../common/ChoiceChips";

type Props = {
    form: PreferenceFields;
    patch: (changes: Partial<PreferenceFields>) => void;
};

const MoodSection = ({ form, patch }: Props) => {
    return (
        <PreferenceSection title="Mood and themes" description="The tone and subjects a movie should lean towards.">
            <ChoiceChips
                label="Emotional tones"
                options={EMOTIONAL_TONES}
                value={form.preferred_emotional_tones}
                onChange={(value) => patch({ preferred_emotional_tones: value })}
            />
            <ChoiceChips label="Themes" options={THEMES} value={form.preferred_themes} onChange={(value) => patch({ preferred_themes: value })} />
        </PreferenceSection>
    );
};

export default MoodSection;
