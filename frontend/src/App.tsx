import { Grid, Paper } from "@mui/material";
import { useApp } from "./context/AppContext";
import UserPanel from "./components/user/UserPanel";
import UserParameters from "./components/parameters/UserParameters";
import Recommendations from "./components/recommendations/Recommendations";

const App = () => {
    const { recommendationsOnSide } = useApp();

    return (
        <Grid
            container
            spacing={2}
            sx={{
                height: "100%",
                overflow: { "xs": "auto", "md": "hidden" },
                p: 2,
                '& > *': {
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    height: { "xs": "auto", "md": "100%" },
                    minHeight: 0,
                    minWidth: 0,
                    overflow: "hidden"
                }
            }}
        >
            <Grid size={{ xs: 12, md: recommendationsOnSide ? 9 : 12 }}>
                <UserPanel />
                <UserParameters />
            </Grid>

            {recommendationsOnSide && (
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper sx={{ p: 2, overflow: "auto" }}>
                        <Recommendations />
                    </Paper>
                </Grid>
            )}
        </Grid>
    );
};

export default App;