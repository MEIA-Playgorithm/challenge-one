import { Box } from "@mui/material";
import { fade } from "../../lib/fade";

// Separador horizontal de todas as abas.
const FadeLine = () => <Box role="separator" sx={(theme) => ({ height: "1px", flexShrink: 0, background: fade(theme, "to right") })} />;

export default FadeLine;
