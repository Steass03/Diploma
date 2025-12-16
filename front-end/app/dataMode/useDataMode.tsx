"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type DataMode = "api" | "mock";

interface DataModeContextType {
  mode: DataMode;
  setMode: (mode: DataMode) => void;
  toggleMode: () => void;
  mounted: boolean;
}

const DataModeContext = createContext<DataModeContextType | undefined>(
  undefined
);

export function DataModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DataMode>("api");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage for saved mode
    const savedMode = localStorage.getItem("data-mode") as DataMode | null;
    if (savedMode) {
      setMode(savedMode);
    } else {
      // Default to API mode
      setMode("api");
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("data-mode", mode);
  }, [mode, mounted]);

  const toggleMode = () => {
    setMode((prev) => (prev === "api" ? "mock" : "api"));
  };

  return (
    <DataModeContext.Provider value={{ mode, setMode, toggleMode, mounted }}>
      {children}
    </DataModeContext.Provider>
  );
}

export function useDataMode() {
  const context = useContext(DataModeContext);
  if (context === undefined) {
    throw new Error("useDataMode must be used within a DataModeProvider");
  }
  return context;
}

