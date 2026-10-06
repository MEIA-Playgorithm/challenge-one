import { Stack } from "@mui/material";
import UserPanel from "./components/UserPanel";
import PreferencesForm from "./components/PreferencesForm";
import MovieWishlist from "./components/MovieWishlist";
import CreditsWishlist from "./components/CreditsWishlist";

const App = () => {
  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{ p: 2, mx: "auto", maxWidth: "lg" }}
    >
      <UserPanel />
      <PreferencesForm />
      <MovieWishlist />
      <CreditsWishlist />
    </Stack>
  );
};

export default App;
