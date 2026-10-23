import { Box, Paper, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { useApp } from "../../context/AppContext";
import Preferences from "../preferences/Preferences";
import Movies from "../movies/Movies";
import PeopleAndOrigins from "./PeopleAndOrigins";
import Dialogue from "../dialogue/Dialogue";
import type { DialogueAnswers } from "../../types/Dialogue";

// Sempre o mesmo objeto: um {} novo a cada render faria o diálogo voltar a pedir sem parar.
const NO_ANSWERS: DialogueAnswers = {};

const UserParameters = () => {
    const { currentUser } = useApp();
    const [selectedTab, setSelectedTab] = useState<string>("preferences");
    // Fica aqui para não se perder ao mudar de separador ou de utilizador.
    const [autosave, setAutosave] = useState(false);
    // As respostas do diálogo de cada utilizador, pelo mesmo motivo.
    const [dialogueAnswers, setDialogueAnswers] = useState<Record<string, DialogueAnswers>>({});

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setSelectedTab(newValue);
    };

    return (
        <Paper sx={{ display: "flex", flexDirection: "column" }}>
            <Tabs
                variant="fullWidth"
                value={selectedTab}
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
                <Tab
                    label="Diálogo"
                    value="dialogue"
                />
            </Tabs>
            <Box sx={{ flex: 1, minHeight: 0, p: 2, overflow: "auto" }}>
                {selectedTab === "preferences" && <Preferences key={currentUser.user_id} autosave={autosave} onAutosaveChange={setAutosave} />}
                {selectedTab === "movies" && <Movies key={currentUser.user_id} autosave={autosave} onAutosaveChange={setAutosave} />}
                {selectedTab === "people-and-origins" && (
                    <PeopleAndOrigins key={currentUser.user_id} autosave={autosave} onAutosaveChange={setAutosave} />
                )}
                {selectedTab === "dialogue" && (
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
