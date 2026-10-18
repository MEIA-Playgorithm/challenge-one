import { Divider, Paper, Stack, Typography } from "@mui/material";
import { useApp } from "../../context/AppContext";
import EngineSelector from "./EngineSelector";
import EngineRecommendations from "./EngineRecommendations";

const Recommendations = () => {
    const { engines } = useApp();

    return (
        <Paper sx={{ p: 2, overflow: "auto" }}>
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recommendations
                </Typography>
                <EngineSelector />
            </Stack>
            {engines.length === 0 && (
                <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                    No engine selected. Select at least one engine to see recommendations.
                </Typography>
            )}
            <Stack spacing={2} divider={<Divider flexItem />} sx={{ mt: 1 }}>
                {engines.map((engine) => (
                    <EngineRecommendations key={engine} engine={engine} showTitle={engines.length > 1} />
                ))}
            </Stack>
        </Paper>
    );
};

export default Recommendations;
