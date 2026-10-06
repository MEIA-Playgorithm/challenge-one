import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AppProvider } from "./context/AppContext";
import App from "./App";

const theme = createTheme({
  palette: {
    primary: { main: "#1B4D3E" },
    secondary: { main: "#C45C26" },
    background: { default: "#f3f1ec", paper: "#ffffff" },
  },
  typography: {
    fontFamily: '"Source Sans 3", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  shape: { borderRadius: 10 },
});

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
