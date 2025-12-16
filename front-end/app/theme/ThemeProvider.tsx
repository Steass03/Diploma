"use client";

import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getTheme } from "./theme";
import { useThemeMode, ThemeModeProvider } from "./useThemeMode";
import { useMemo } from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
}

function MuiThemeProviderWrapper({ children }: ThemeProviderProps) {
  const { mode } = useThemeMode();
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeModeProvider>
      <MuiThemeProviderWrapper>{children}</MuiThemeProviderWrapper>
    </ThemeModeProvider>
  );
}
