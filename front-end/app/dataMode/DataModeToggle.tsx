"use client";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ApiIcon from "@mui/icons-material/Api";
import StorageIcon from "@mui/icons-material/Storage";
import { useDataMode } from "./useDataMode";

export function DataModeToggle() {
  const { mode, toggleMode, mounted } = useDataMode();

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <Tooltip title={mode === "api" ? "Використовувати мок-дані" : "Використовувати API"}>
      <IconButton
        onClick={toggleMode}
        color="inherit"
        aria-label="toggle data mode"
        sx={{
          opacity: 0.6,
          "&:hover": {
            opacity: 1,
          },
        }}
      >
        {mode === "api" ? <ApiIcon fontSize="small" /> : <StorageIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}

