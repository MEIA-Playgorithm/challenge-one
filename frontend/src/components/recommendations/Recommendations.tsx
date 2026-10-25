import ViewSidebarIcon from "@mui/icons-material/ViewSidebar";
import TabIcon from "@mui/icons-material/Tab";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useApp } from "../../context/AppContext";
import EngineSelector from "./EngineSelector";
import EngineRecommendations from "./EngineRecommendations";

// As recomendações de cada motor escolhido. Na aba ficam lado a lado (umas por baixo das outras
// em ecrãs estreitos); no painel ao lado ficam sempre umas por baixo das outras.
const Recommendations = () => {
    const { engines, recommendationsOnSide, setRecommendationsOnSide } = useApp();
    const columns = recommendationsOnSide ? 1 : Math.max(engines.length, 1);

    return (
        <Stack spacing={2}>
            <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                {/* Na aba, o nome já está na barra de abas; só o painel lateral precisa do título. */}
                {recommendationsOnSide && (
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Recomendações
                    </Typography>
                )}
                <Stack direction="row" sx={{ alignItems: "center", gap: 1, ml: "auto" }}>
                    <EngineSelector />
                    <Tooltip title={recommendationsOnSide ? "Mostrar como separador" : "Mostrar ao lado"}>
                        <IconButton
                            size="small"
                            aria-label={recommendationsOnSide ? "Mostrar recomendações como separador" : "Mostrar recomendações ao lado"}
                            onClick={() => setRecommendationsOnSide(!recommendationsOnSide)}
                        >
                            {recommendationsOnSide ? <TabIcon /> : <ViewSidebarIcon />}
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>
            {engines.length === 0 && (
                <Typography color="textSecondary" variant="body2" sx={{ mt: 1 }}>
                    Nenhum motor selecionado. Seleciona pelo menos um motor para ver recomendações.
                </Typography>
            )}
            <Box
                sx={{
                    display: "grid",
                    gap: 3,
                    gridTemplateColumns: { xs: "1fr", md: `repeat(${columns}, minmax(0, 1fr))` },
                }}
            >
                {engines.map((engine) => (
                    <EngineRecommendations key={engine} engine={engine} showTitle={engines.length > 1} />
                ))}
            </Box>
        </Stack>
    );
};

export default Recommendations;
