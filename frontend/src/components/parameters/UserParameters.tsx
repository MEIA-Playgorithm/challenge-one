import { Box, Paper, Tab, Tabs } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import Preferences from "../preferences/Preferences";
import Movies from "../movies/Movies";
import PeopleAndOrigins from "./PeopleAndOrigins";
import Recommendations from "../recommendations/Recommendations";
import Dialogue from "../dialogue/Dialogue";
import type { DialogueAnswers } from "../../types/Dialogue";

// Stable object: a fresh {} each render would make the dialogue refetch forever.
const NO_ANSWERS: DialogueAnswers = {};

const UserParameters = () => {
    const { currentUser, recommendationsOnSide } = useApp();
    const [selectedTab, setSelectedTab] = useState<string>("preferences");
    // Fica aqui para não se perder ao mudar de separador ou de utilizador.
    const [autosave, setAutosave] = useState(false);
    // Each user's dialogue answers, for the same reason.
    const [dialogueAnswers, setDialogueAnswers] = useState<Record<string, DialogueAnswers>>({});

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

    return (
        <Paper sx={{ display: "flex", flexDirection: "column" }}>
            <Tabs
                variant="fullWidth"
                value={tab}
                onChange={handleTabChange}
                aria-label="parâmetros do utilizador"
                sx={{ flexShrink: 0, borderBottom: 1, borderColor: "divider" }}
            >
                <Tab
                    label="Preferências"
                    value="preferences"
                />
                <Tab
                    label="Filmes"
                    value="movies"
                />
                <Tab
                    label="Pessoas e origens"
                    value="people-and-origins"
                />
                {!recommendationsOnSide && (
                    <Tab
                        label="Recomendações"
                        value="recommendations"
                    />
                )}
                <Tab
                    label="Diálogo"
                    value="dialogue"
                />
            </Tabs>
            <Box sx={{ flex: 1, minHeight: 0, p: 2, overflow: "auto" }}>
                {tab === "preferences" && <Preferences key={currentUser.user_id} autosave={autosave} onAutosaveChange={setAutosave} />}
                {tab === "movies" && <Movies key={currentUser.user_id} autosave={autosave} onAutosaveChange={setAutosave} />}
                {tab === "people-and-origins" && (
                    <PeopleAndOrigins key={currentUser.user_id} autosave={autosave} onAutosaveChange={setAutosave} />
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
