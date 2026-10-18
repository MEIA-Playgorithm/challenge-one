import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useApp } from "../context/AppContext";
import { config, type EngineId } from "../lib/config";

// Escolhe que motores mostrar: nenhum, um ou vários.
const EngineSelector = () => {
    const { engines, setEngines } = useApp();

    return (
        <ToggleButtonGroup
            size="small"
            value={engines}
            onChange={(_, selected: EngineId[]) => setEngines(selected)}
        >
            {(Object.keys(config.engines) as EngineId[]).map((id) => (
                <ToggleButton key={id} value={id}>
                    {config.engines[id].label}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
};

export default EngineSelector;
