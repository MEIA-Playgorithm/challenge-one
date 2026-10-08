import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppProvider } from "./context/AppContext";
import App from "./App";
import theme from "./lib/theme";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppProvider>
                <App />
            </AppProvider>
        </ThemeProvider>
    </StrictMode>
);
