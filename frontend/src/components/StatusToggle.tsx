import type { ReactNode } from "react";
import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import type { PreferenceStatus } from "../types/Movie";
import { PREFERENCE_STATUS_LABELS } from "../types/Movie";

const OPTIONS: {
  value: PreferenceStatus;
  icon: ReactNode;
  color: "success" | "error" | "info" | "warning";
}[] = [
  { value: "liked", icon: <ThumbUpAltOutlinedIcon fontSize="small" />, color: "success" },
  { value: "disliked", icon: <ThumbDownAltOutlinedIcon fontSize="small" />, color: "error" },
  { value: "want_to_see", icon: <VisibilityOutlinedIcon fontSize="small" />, color: "info" },
  { value: "skip", icon: <VisibilityOffOutlinedIcon fontSize="small" />, color: "warning" },
];

type Props = {
  value: PreferenceStatus | null;
  onChange: (next: PreferenceStatus | null) => void;
};

export default function StatusToggle({ value, onChange }: Props) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      onChange={(_, next: PreferenceStatus | null) => onChange(next)}
      sx={{
        "& .MuiToggleButton-root": {
          px: 1,
          py: 0.5,
          borderColor: "divider",
        },
      }}
    >
      {OPTIONS.map((opt) => (
        <ToggleButton
          key={opt.value}
          value={opt.value}
          color={opt.color}
          aria-label={PREFERENCE_STATUS_LABELS[opt.value]}
        >
          <Tooltip title={PREFERENCE_STATUS_LABELS[opt.value]} arrow>
            <span style={{ display: "flex", alignItems: "center" }}>{opt.icon}</span>
          </Tooltip>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
