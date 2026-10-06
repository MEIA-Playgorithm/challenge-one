import { Box, Chip, Divider, IconButton, List, ListItem, Typography } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

type Props = {
  label: string;
  all: string[];
  selected: string[];
  excluded?: string[];
  maxItems?: number;
  onChange: (next: string[]) => void;
};

export default function RankedSelector({
  label,
  all,
  selected,
  excluded = [],
  maxItems = 5,
  onChange,
}: Props) {
  const available = all.filter((item) => !selected.includes(item) && !excluded.includes(item));

  const add = (item: string) => {
    if (selected.length >= maxItems) return;
    onChange([...selected, item]);
  };

  const remove = (item: string) => onChange(selected.filter((s) => s !== item));

  const move = (index: number, dir: -1 | 1) => {
    const next = [...selected];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {label}
      </Typography>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.disabled" sx={{ mb: 0.5, display: "block" }}>
            Available
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, minHeight: 36 }}>
            {available.length === 0 && (
              <Typography variant="caption" color="text.disabled" sx={{ alignSelf: "center" }}>
                {selected.length >= maxItems ? `Max ${maxItems} reached` : "None left"}
              </Typography>
            )}
            {available.map((item) => (
              <Chip
                key={item}
                label={item}
                size="small"
                icon={<AddIcon />}
                onClick={() => add(item)}
                disabled={selected.length >= maxItems}
                variant="outlined"
                sx={{ cursor: "pointer" }}
              />
            ))}
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem />

        <Box sx={{ width: 220 }}>
          <Typography variant="caption" color="text.disabled" sx={{ mb: 0.5, display: "block" }}>
            Selected (ordered)
          </Typography>
          {selected.length === 0 ? (
            <Typography variant="caption" color="text.disabled">
              Click items to add
            </Typography>
          ) : (
            <List dense disablePadding>
              {selected.map((item, idx) => (
                <ListItem
                  key={item}
                  disablePadding
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    py: 0.25,
                    bgcolor: idx === 0 ? "primary.50" : "transparent",
                    borderRadius: 1,
                    px: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, width: 18, color: idx === 0 ? "primary.main" : "text.secondary" }}
                  >
                    {idx + 1}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {item}
                  </Typography>
                  <IconButton size="small" onClick={() => move(idx, -1)} disabled={idx === 0} sx={{ p: 0.25 }}>
                    <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => move(idx, 1)} disabled={idx === selected.length - 1} sx={{ p: 0.25 }}>
                    <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => remove(item)} sx={{ p: 0.25 }}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Box>
  );
}
