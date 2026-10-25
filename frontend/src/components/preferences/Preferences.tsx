import { Stack } from "@mui/material";
import FadeLine from "../common/FadeLine";
import type { limitErrors, PreferenceFields } from "../../lib/preferences";
import GenresSection from "./GenresSection";
import LanguagesSection from "./LanguagesSection";
import TraitsSection from "./TraitsSection";
import MoodSection from "./MoodSection";
import LimitsSection from "./LimitsSection";

type Props = {
    form: PreferenceFields;
    errors: ReturnType<typeof limitErrors>;
    userAge: number;
    patch: (changes: Partial<PreferenceFields>) => void;
};

// O formulário vem de Configuration, que também guarda.
const Preferences = ({ form, errors, userAge, patch }: Props) => {
    return (
        <Stack spacing={3} divider={<FadeLine />} sx={{ pb: 3 }}>
            <GenresSection form={form} patch={patch} />
            <LanguagesSection form={form} patch={patch} />
            <TraitsSection form={form} patch={patch} />
            <MoodSection form={form} patch={patch} />
            <LimitsSection form={form} errors={errors} userAge={userAge} patch={patch} />
        </Stack>
    );
};

export default Preferences;
