import { createTheme } from "@mui/material";
import { ptPT } from "@mui/material/locale";

// Colours taken from the Playgorithm blog (playgorithm.blogspot.com).
const palette = {
    primary: { main: "#2ac79a", contrastText: "#061713" },
    secondary: { main: "#80ff8c", contrastText: "#061713" },
    background: { default: "#061713", paper: "#0f1e1b" },
    text: { primary: "#ffffff", secondary: "#909795" },
    divider: "rgba(42, 199, 154, 0.18)",
};

const theme = createTheme({
    palette: {
        mode: "dark",
        ...palette,
    },
    typography: {
        fontFamily: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        button: { letterSpacing: 0, textTransform: "none" },
    },
    shape: { borderRadius: 6 },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                html: {
                    height: "100%",
                    overflow: "hidden",
                    margin: 0,
                },
                body: {
                    backgroundColor: palette.background.default,
                    height: "100%",
                    margin: 0,
                    overflow: "hidden",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#135542 transparent",
                    "& *": { scrollbarWidth: "thin", scrollbarColor: "#135542 transparent" },
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": { width: 10, height: 10 },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        backgroundColor: "#135542",
                        borderRadius: 8,
                    },
                },
                "#root": {
                    height: "100%",
                    margin: 0,
                    overflow: "hidden",
                },
                '.toast:not([data-type]), .toast[data-type="loading"]': {
                    backgroundColor: `${palette.background.default} !important`,
                    color: `${palette.text.primary} !important`,
                    border: `1px solid ${palette.divider} !important`,
                },
            },
        },
        MuiPaper: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundImage: "none",
                    backgroundColor: palette.background.paper,
                    border: "1px solid",
                    borderColor: theme.palette.divider,
                    borderRadius: theme.shape.borderRadius,
                    overflow: "hidden",
                    width: "100%",
                    flex: 1,
                    minHeight: 0,
                }),
            },
        },
    },
}, ptPT);

export default theme;