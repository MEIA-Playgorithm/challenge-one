import { Box, Paper, Tab, Tabs } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import Preferences from "../preferences/Preferences";
import Movies from "../movies/Movies";
import PeopleAndOrigins from "./PeopleAndOrigins";
import Recommendations from "../recommendations/Recommendations";

const UserParameters = () => {
    const { currentUser, recommendationsOnSide } = useApp();
    const [selectedTab, setSelectedTab] = useState<string>("preferences");
    // Fica aqui para não se perder ao mudar de separador ou de utilizador.
    const [autosave, setAutosave] = useState(false);

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
                aria-label="user parameters"
                sx={{ flexShrink: 0, borderBottom: 1, borderColor: "divider" }}
            >
                <Tab
                    label="Preferences"
                    value="preferences"
                />
                <Tab
                    label="Movies"
                    value="movies"
                />
                <Tab
                    label="People and Origins"
                    value="people-and-origins"
                />
                {!recommendationsOnSide && (
                    <Tab
                        label="Recommendations"
                        value="recommendations"
                    />
                )}
            </Tabs>
            <Box sx={{ flex: 1, minHeight: 0, p: 2, overflow: "auto" }}>
                {tab === "preferences" && <Preferences key={currentUser.user_id} autosave={autosave} onAutosaveChange={setAutosave} />}
                {tab === "movies" && <Movies key={currentUser.user_id} autosave={autosave} onAutosaveChange={setAutosave} />}
                {tab === "people-and-origins" && <PeopleAndOrigins />}
                {tab === "recommendations" && <Recommendations />}
            </Box>
        </Paper>
    );
};

export default UserParameters;
