import { Grid } from "@mui/material";
import UserPanel from "./components/user/UserPanel";
import UserParameters from "./components/parameters/UserParameters";
import Recommendations from "./components/recommendations/Recommendations";

const App = () => {
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
            <Grid size={{ xs: 12, md: 9 }}>
                <UserPanel />
                <UserParameters />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
                <Recommendations />
            </Grid>
        </Grid>
    );
};

export default App;