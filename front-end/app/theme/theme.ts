"use client";

import { createTheme } from "@mui/material/styles";

// Declare module augmentation for custom palette colors
declare module "@mui/material/styles" {
  interface Palette {
    neutral: {
      main: string;
      dark: string;
      light: string;
    };
  }
  interface PaletteOptions {
    neutral?: {
      main?: string;
      dark?: string;
      light?: string;
    };
  }
}

// Create theme with actual color values - MUI handles dark/light mode automatically
export const getTheme = (mode: "light" | "dark") => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#1976d2" : "#90caf9",
        light: mode === "light" ? "#42a5f5" : "#e3f2fd",
        dark: mode === "light" ? "#1565c0" : "#42a5f5",
        contrastText: mode === "light" ? "#ffffff" : "rgba(0, 0, 0, 0.87)",
      },
      secondary: {
        main: mode === "light" ? "#9c27b0" : "#ce93d8",
        light: mode === "light" ? "#ba68c8" : "#f3e5f5",
        dark: mode === "light" ? "#7b1fa2" : "#ab47bc",
        contrastText: mode === "light" ? "#ffffff" : "rgba(0, 0, 0, 0.87)",
      },
      error: {
        main: mode === "light" ? "#d32f2f" : "#f44336",
        light: mode === "light" ? "#ef5350" : "#e57373",
        dark: mode === "light" ? "#c62828" : "#d32f2f",
        contrastText: "#ffffff",
      },
      warning: {
        main: mode === "light" ? "#ed6c02" : "#ffa726",
        light: mode === "light" ? "#ff9800" : "#ffb74d",
        dark: mode === "light" ? "#e65100" : "#f57c00",
        contrastText: mode === "light" ? "#ffffff" : "rgba(0, 0, 0, 0.87)",
      },
      info: {
        main: mode === "light" ? "#0288d1" : "#29b6f6",
        light: mode === "light" ? "#03a9f4" : "#4fc3f7",
        dark: mode === "light" ? "#01579b" : "#0288d1",
        contrastText: mode === "light" ? "#ffffff" : "rgba(0, 0, 0, 0.87)",
      },
      success: {
        main: mode === "light" ? "#2e7d32" : "#66bb6a",
        light: mode === "light" ? "#4caf50" : "#81c784",
        dark: mode === "light" ? "#1b5e20" : "#388e3c",
        contrastText: mode === "light" ? "#ffffff" : "rgba(0, 0, 0, 0.87)",
      },
      // MUI will automatically generate background and text colors based on mode
      // but we can customize them if needed
      background: {
        default: mode === "light" ? "#ffffff" : "#121212",
        paper: mode === "light" ? "#ffffff" : "#1e1e1e",
      },
      text: {
        primary:
          mode === "light"
            ? "rgba(0, 0, 0, 0.87)"
            : "rgba(255, 255, 255, 0.87)",
        secondary:
          mode === "light" ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.6)",
        disabled:
          mode === "light"
            ? "rgba(0, 0, 0, 0.38)"
            : "rgba(255, 255, 255, 0.38)",
      },
      divider:
        mode === "light" ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.12)",
      action: {
        active:
          mode === "light"
            ? "rgba(0, 0, 0, 0.54)"
            : "rgba(255, 255, 255, 0.87)",
        hover:
          mode === "light"
            ? "rgba(0, 0, 0, 0.04)"
            : "rgba(255, 255, 255, 0.08)",
        selected:
          mode === "light"
            ? "rgba(0, 0, 0, 0.08)"
            : "rgba(255, 255, 255, 0.16)",
        disabled:
          mode === "light" ? "rgba(0, 0, 0, 0.26)" : "rgba(255, 255, 255, 0.3)",
        disabledBackground:
          mode === "light"
            ? "rgba(0, 0, 0, 0.12)"
            : "rgba(255, 255, 255, 0.12)",
      },
    },
    typography: {
      fontFamily: "var(--mui-font-family)",
      h1: {
        fontFamily: "var(--mui-font-family)",
      },
      h2: {
        fontFamily: "var(--mui-font-family)",
      },
      h3: {
        fontFamily: "var(--mui-font-family)",
      },
      h4: {
        fontFamily: "var(--mui-font-family)",
      },
      h5: {
        fontFamily: "var(--mui-font-family)",
      },
      h6: {
        fontFamily: "var(--mui-font-family)",
      },
      body1: {
        fontFamily: "var(--mui-font-family)",
      },
      body2: {
        fontFamily: "var(--mui-font-family)",
      },
      button: {
        fontFamily: "var(--mui-font-family)",
        textTransform: "none" as const,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: "var(--mui-font-family)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  });
};
