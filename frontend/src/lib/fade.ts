import { alpha, type Theme } from "@mui/material";

// Linha tenue que desvanece nas pontas, por isso não chega ao fim.
export const fade = (theme: Theme, direction: "to right" | "to bottom") => {
    const line = alpha(theme.palette.primary.main, 0.35);
    return `linear-gradient(${direction}, transparent, ${line} 12%, ${line} 88%, transparent)`;
};
