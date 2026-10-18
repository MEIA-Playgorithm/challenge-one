import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

type Props = {
    title: string;
    description: string;
    children: ReactNode;
};

const PreferenceSection = ({ title, description, children }: Props) => {
    return (
        <Stack component="section" direction={{ xs: "column", md: "row" }} spacing={{ xs: 2, md: 4 }}>
            <Box sx={{ width: { md: 220 }, flexShrink: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            </Box>
            <Stack spacing={3} sx={{ flex: 1, minWidth: 0 }}>
                {children}
            </Stack>
        </Stack>
    );
};

export default PreferenceSection;
