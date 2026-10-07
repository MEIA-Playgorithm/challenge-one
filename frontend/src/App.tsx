import { Box, Grid, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import UserPanel from "./components/UserPanel";
import PreferencesForm from "./components/PreferencesForm";
import MovieWishlist from "./components/MovieWishlist";
import CreditsWishlist from "./components/CreditsWishlist";
import { useState } from "react";

const App = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  return (
    <Box
      sx={{
        boxSizing: "border-box",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        p: 2,
        mx: "auto",
        width: '100vw',
      }}
    >
      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0, height: "100%" }}>
        <Grid size={9} sx={{ minHeight: 0, height: "100%", display: "flex" }}>
          <Stack spacing={2} sx={{ flex: 1, minHeight: 0, width: "100%" }}>
            <UserPanel />
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Tabs
                value={selectedTab}
                onChange={(_, newValue) => setSelectedTab(newValue)}
                sx={{ px: 1, borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
              >
                <Tab label="Preferences" />
                <Tab label="Wishlist" />
                <Tab label="Credits" />
              </Tabs>
              <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                {selectedTab === 0 && <PreferencesForm />}
                {selectedTab === 1 && <MovieWishlist />}
                {selectedTab === 2 && <CreditsWishlist />}
              </Box>
            </Paper>
          </Stack>
        </Grid>
        <Grid size={3} sx={{ minHeight: 0, height: "100%", display: "flex" }}>
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              width: "100%",
              bgcolor: "red",
              color: "white",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h6">TODO</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default App;
