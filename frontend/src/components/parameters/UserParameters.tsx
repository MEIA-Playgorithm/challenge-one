import { Box, Paper, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { useApp } from "../../context/AppContext";
import Preferences from "../preferences/Preferences";
import Movies from "../movies/Movies";
import PeopleAndOrigins from "./PeopleAndOrigins";

const UserParameters = () => {
    const { currentUser } = useApp();
    const [selectedTab, setSelectedTab] = useState<string>("preferences");
    // Fica aqui para não se perder ao mudar de separador ou de utilizador.
    const [autosave, setAutosave] = useState(false);

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setSelectedTab(newValue);
    };

    return (
        <Paper sx={{ display: "flex", flexDirection: "column" }}>
            <Tabs
                variant="fullWidth"
                value={selectedTab}
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
            </Tabs>
            <Box sx={{ flex: 1, minHeight: 0, p: 2, overflow: "auto" }}>
                {selectedTab === "preferences" && <Preferences key={currentUser.user_id} autosave={autosave} onAutosaveChange={setAutosave} />}
                {selectedTab === "movies" && <Movies key={currentUser.user_id} autosave={autosave} onAutosaveChange={setAutosave} />}
                {selectedTab === "people-and-origins" && <PeopleAndOrigins />}
            </Box>
        </Paper>
    );
};

export default UserParameters;
