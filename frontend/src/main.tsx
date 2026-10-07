import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AppProvider } from "./context/AppContext";
import App from "./App";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#c4a06a", contrastText: "#1c140c" },
    secondary: { main: "#efe6d6", contrastText: "#1c140c" },
    background: { default: "#141210", paper: "#1c1916" },
    text: { primary: "#f3efe6", secondary: "#a39a8c" },
    divider: "rgba(243, 239, 230, 0.12)",
    success: { main: "#8a9470" },
    error: { main: "#c96b6b" },
    info: { main: "#7d90a3" },
    warning: { main: "#c4a15a" },
  },
  typography: {
    fontFamily: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h6: { fontWeight: 600, fontSize: "1.05rem", letterSpacing: 0 },
    button: { letterSpacing: 0, textTransform: "none" },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#141210",
          scrollbarWidth: "thin",
          scrollbarColor: "#4a433a transparent",
          "& *": { scrollbarWidth: "thin", scrollbarColor: "#4a433a transparent" },
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": { width: 10, height: 10 },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            backgroundColor: "#4a433a",
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none", backgroundColor: "#1c1916" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: "none" },
        contained: { boxShadow: "none", "&:hover": { boxShadow: "none" } },
      },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: "none" } },
    },
    MuiTextField: {
      defaultProps: {
        autoComplete: "off",
        slotProps: { htmlInput: { spellCheck: false, autoComplete: "off" } },
      },
    },
  },
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
