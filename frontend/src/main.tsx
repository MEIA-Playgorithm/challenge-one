import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppProvider } from "./context/AppContext";
import App from "./App";
import { loadConfig } from "./lib/config";
import theme from "./lib/theme";

const root = createRoot(document.getElementById("root")!);

// A configuração (URLs dos serviços) tem de estar carregada antes de a app arrancar.
loadConfig()
    .then(() =>
        root.render(
            <StrictMode>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <AppProvider>
                        <App />
                    </AppProvider>
                </ThemeProvider>
            </StrictMode>
        )
    )
    .catch((err: Error) => root.render(<p>{err.message}</p>));
