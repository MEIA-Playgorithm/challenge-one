import { createTheme } from "@mui/material";

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#c4a06a", contrastText: "#1c140c" },
        secondary: { main: "#efe6d6", contrastText: "#1c140c" },
        background: { default: "#141210", paper: "#1c1916" },
        text: { primary: "#f3efe6", secondary: "#a39a8c" },
        divider: "rgba(243, 239, 230, 0.12)",
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
                    backgroundColor: "#141210",
                    height: "100%",
                    margin: 0,
                    overflow: "hidden",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#4a433a transparent",
                    "& *": { scrollbarWidth: "thin", scrollbarColor: "#4a433a transparent" },
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": { width: 10, height: 10 },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        backgroundColor: "#4a433a",
                        borderRadius: 8,
                    },
                },
                "#root": {
                    height: "100%",
                    margin: 0,
                    overflow: "hidden",
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
                    backgroundColor: "#1c1916",
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
});

export default theme;