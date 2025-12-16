"use client";

import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useThemeMode } from "./useThemeMode";

export function ThemeToggle() {
  const { mode, toggleMode, mounted } = useThemeMode();

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <IconButton onClick={toggleMode} color="inherit" aria-label="toggle theme">
      {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
}
