import { Box, Chip, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
  label: string;
  all: string[];
  selected: string[];
  blocked?: string[];
  onChange: (next: string[]) => void;
};

export default function ExcludeSelector({ label, all, selected, blocked = [], onChange }: Props) {
  const available = all.filter((item) => !selected.includes(item) && !blocked.includes(item));

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {label}
      </Typography>

      {selected.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
          {selected.map((item) => (
            <Chip
              key={item}
              label={item}
              size="small"
              color="error"
              variant="outlined"
              onDelete={() => onChange(selected.filter((s) => s !== item))}
              deleteIcon={<CloseIcon />}
            />
          ))}
        </Box>
      )}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, minHeight: 32 }}>
        {available.length === 0 ? (
          <Typography variant="caption" color="text.disabled">
            {selected.length === 0 && blocked.length > 0 ? "All remaining are preferred" : "None left"}
          </Typography>
        ) : (
          available.map((item) => (
            <Chip
              key={item}
              label={item}
              size="small"
              onClick={() => onChange([...selected, item])}
              variant="outlined"
              sx={{ cursor: "pointer" }}
            />
          ))
        )}
      </Box>
    </Box>
  );
}
