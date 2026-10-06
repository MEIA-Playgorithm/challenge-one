import { Box, Chip, Stack, Typography } from "@mui/material";

const PreferenceChips = ({
  label,
  items,
  color,
}: {
  label: string;
  items: string[];
  color?: "primary" | "error" | "default";
}) => {
  if (items.length === 0) return null;

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
        {items.map((item, idx) => (
          <Chip
            key={item}
            label={color === "primary" ? `${idx + 1}. ${item}` : item}
            size="small"
            color={color === "default" ? undefined : color}
            variant={color === "error" ? "outlined" : "filled"}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default PreferenceChips;
