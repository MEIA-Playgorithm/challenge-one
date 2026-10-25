import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import { fade } from "../../lib/fade";
import Recommendations from "../recommendations/Recommendations";
import Dialogue from "../dialogue/Dialogue";
import Configuration, { type ConfigTab } from "./Configuration";
import type { DialogueAnswers } from "../../types/Dialogue";

// Stable object: a fresh {} each render would make the dialogue refetch forever.
const NO_ANSWERS: DialogueAnswers = {};

const CONFIG_TABS: ConfigTab[] = ["preferences", "movies", "people-and-origins"];

// O nome de um grupo de abas, antes das suas abas.
const GroupLabel = ({ children }: { children: string }) => (
    <Typography variant="caption" color="textSecondary" sx={{ px: 1.5, letterSpacing: 1, textTransform: "uppercase" }}>
        {children}
    </Typography>
);

const UserParameters = () => {
    const { currentUser, recommendationsOnSide } = useApp();
    const [selectedTab, setSelectedTab] = useState<string>("preferences");
    // Fica aqui para não se perder ao mudar de separador ou de utilizador.
    const [autosave, setAutosave] = useState(false);
    // Each user's dialogue answers, for the same reason.
    const [dialogueAnswers, setDialogueAnswers] = useState<Record<string, DialogueAnswers>>({});
    // As abas de configuração de cada utilizador com alterações por guardar.
    const [dirtyTabs, setDirtyTabs] = useState<Record<string, ConfigTab[]>>({});

    // Ao passar as recomendações do lado para a aba, abre essa aba.
    const wasOnSide = useRef(recommendationsOnSide);
    useEffect(() => {
        if (wasOnSide.current && !recommendationsOnSide) setSelectedTab("recommendations");
        wasOnSide.current = recommendationsOnSide;
    }, [recommendationsOnSide]);
    // Com as recomendações ao lado a aba não existe.
    const tab = recommendationsOnSide && selectedTab === "recommendations" ? "preferences" : selectedTab;

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setSelectedTab(newValue);
    };

    // O nome de uma aba de configuração, com um ponto ao lado se tiver alterações por guardar
    // (o espaço do ponto está sempre reservado, para o nome não se mexer).
    const configLabel = (text: string, name: ConfigTab) => (
        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
            {text}
            <Box
                component="span"
                sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main", opacity: dirtyTabs[currentUser.user_id]?.includes(name) ? 1 : 0 }}
            />
        </Box>
    );

    const isConfig = CONFIG_TABS.includes(tab as ConfigTab);

    return (
        <Paper sx={{ display: "flex", flexDirection: "column" }}>
            {/* Uma só linha: cada grupo tem o nome antes das suas abas, e uma linha tenue separa os dois. */}
            <Box sx={{ display: "flex", alignItems: "center", px: 1, borderBottom: 1, borderColor: "divider" }}>
                <GroupLabel>Configurações</GroupLabel>
                <Tabs value={isConfig ? tab : false} onChange={handleTabChange} aria-label="configurações do utilizador">
                    <Tab label={configLabel("Preferências", "preferences")} value="preferences" />
                    <Tab label={configLabel("Filmes", "movies")} value="movies" />
                    <Tab label={configLabel("Pessoas e origens", "people-and-origins")} value="people-and-origins" />
                </Tabs>
                <Box sx={(theme) => ({ alignSelf: "stretch", my: 1.5, mx: 2, width: "1px", background: fade(theme, "to bottom") })} />
                <GroupLabel>Resultados</GroupLabel>
                <Tabs value={isConfig ? false : tab} onChange={handleTabChange} aria-label="resultados dos motores">
                    {!recommendationsOnSide && <Tab label="Recomendações" value="recommendations" />}
                    <Tab label="Diálogo" value="dialogue" />
                </Tabs>
            </Box>
            <Box sx={{ flex: 1, minHeight: 0, p: 2, overflow: "auto" }}>
                {CONFIG_TABS.includes(tab as ConfigTab) && (
                    <Configuration
                        key={currentUser.user_id}
                        tab={tab as ConfigTab}
                        autosave={autosave}
                        onAutosaveChange={setAutosave}
                        onDirtyChange={(userId, tabs) => setDirtyTabs((current) => ({ ...current, [userId]: tabs }))}
                    />
                )}
                {tab === "recommendations" && <Recommendations />}
                {tab === "dialogue" && (
                    <Dialogue
                        key={currentUser.user_id}
                        answers={dialogueAnswers[currentUser.user_id] ?? NO_ANSWERS}
                        onAnswersChange={(answers) => setDialogueAnswers((current) => ({ ...current, [currentUser.user_id]: answers }))}
                    />
                )}
            </Box>
        </Paper>
    );
};

export default UserParameters;
