import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AppProvider } from "./context/AppContext";
import App from "./App";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#2EE6A6", contrastText: "#04110c" },
    secondary: { main: "#7CFFD4", contrastText: "#04110c" },
    background: { default: "#070c0b", paper: "#0e1614" },
    text: { primary: "#e8f6f1", secondary: "#8aa39a" },
    divider: "rgba(46, 230, 166, 0.16)",
    success: { main: "#2EE6A6" },
    error: { main: "#ff6b81" },
    info: { main: "#5ec8ff" },
    warning: { main: "#e8c547" },
  },
  typography: {
    fontFamily: '"Outfit", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h6: {
      fontWeight: 600,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      fontSize: "0.8rem",
    },
    button: { letterSpacing: "0.06em" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#070c0b",
          backgroundImage:
            "radial-gradient(ellipse 70% 45% at 0% -10%, rgba(46, 230, 166, 0.1), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 0%, rgba(46, 230, 166, 0.06), transparent 50%)",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(46, 230, 166, 0.55) rgba(46, 230, 166, 0.08)",
          "& *": {
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(46, 230, 166, 0.55) rgba(46, 230, 166, 0.08)",
          },
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            width: 10,
            height: 10,
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track": {
            backgroundColor: "rgba(46, 230, 166, 0.08)",
            borderRadius: 999,
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 999,
            backgroundColor: "rgba(46, 230, 166, 0.45)",
            border: "2px solid #0e1614",
            minHeight: 24,
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#2EE6A6",
          },
          "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
            backgroundColor: "transparent",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#0e1614",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: "0 0 18px rgba(46, 230, 166, 0.22)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlined: {
          borderColor: "rgba(46, 230, 166, 0.35)",
        },
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
