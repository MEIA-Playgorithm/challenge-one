import { Box, Button, Stack, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
    dirty: boolean;
    error?: string;
    onReset: () => void;
    onSave: () => void;
};

const SaveBar = ({ dirty, error, onReset, onSave }: Props) => {
    return (
        <Box
            sx={{
                position: "sticky",
                bottom: -16,
                zIndex: 1,
                mx: -2,
                mb: -2,
                px: 2,
                py: 1.5,
                borderTop: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography
                    variant="body2"
                    color={error ? "error" : dirty ? "primary" : "text.secondary"}
                    sx={{ flex: 1 }}
                >
                    {error ?? (dirty ? "Unsaved changes" : "All changes saved")}
                </Typography>
                <Button
                    variant="text"
                    size="small"
                    color="inherit"
                    startIcon={<CloseIcon />}
                    disabled={!dirty}
                    onClick={onReset}
                >
                    Reset
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<CheckIcon />}
                    disabled={!dirty || Boolean(error)}
                    onClick={onSave}
                >
                    Save
                </Button>
            </Stack>
        </Box>
    );
};

export default SaveBar;
