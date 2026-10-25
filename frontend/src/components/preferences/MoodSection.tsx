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
        <PreferenceSection title="Ambiente e temas" description="O tom e os assuntos para que um filme deve tender.">
            <ChoiceChips
                label="Tons emocionais"
                options={EMOTIONAL_TONES}
                value={form.preferred_emotional_tones}
                onChange={(value) => patch({ preferred_emotional_tones: value })}
            />
            <ChoiceChips label="Temas" options={THEMES} value={form.preferred_themes} onChange={(value) => patch({ preferred_themes: value })} />
        </PreferenceSection>
    );
};

export default MoodSection;
