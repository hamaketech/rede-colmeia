/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getFeatureFlags } from "@/lib/flags/featureFlags";

export type ThemeMode = "light" | "dark";
export type CvdMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";

type VisualModeContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  cvdMode: CvdMode;
  setCvdMode: (mode: CvdMode) => void;
  themeModes: { id: ThemeMode; label: string }[];
  cvdModes: { id: CvdMode; label: string; compactLabel: string }[];
  enabled: boolean;
};

const themeStorageKey = "rede-colmeia-theme-mode";
const cvdStorageKey = "rede-colmeia-cvd-mode";
const legacyStorageKey = "rede-colmeia-visual-mode";

const themeModes = [
  { id: "light" as const, label: "Light" },
  { id: "dark" as const, label: "Dark" }
];

const cvdModes = [
  { id: "none" as const, label: "No CVD filter", compactLabel: "Off" },
  { id: "protanopia" as const, label: "Protanopia", compactLabel: "P" },
  { id: "deuteranopia" as const, label: "Deuteranopia", compactLabel: "D" },
  { id: "tritanopia" as const, label: "Tritanopia", compactLabel: "T" }
];

function parseLegacyVisualMode(value: string | null): { themeMode: ThemeMode; cvdMode: CvdMode } | null {
  if (!value) {
    return null;
  }
  switch (value) {
    case "standard":
      return { themeMode: "light", cvdMode: "none" };
    case "high-contrast":
      return { themeMode: "dark", cvdMode: "none" };
    case "cvd-protanopia":
      return { themeMode: "dark", cvdMode: "protanopia" };
    case "cvd-deuteranopia":
      return { themeMode: "dark", cvdMode: "deuteranopia" };
    case "cvd-tritanopia":
      return { themeMode: "dark", cvdMode: "tritanopia" };
    default:
      return null;
  }
}

const VisualModeContext = createContext<VisualModeContextValue | undefined>(undefined);

export function VisualModeProvider({ children }: { children: ReactNode }) {
  const flags = getFeatureFlags();
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [cvdMode, setCvdMode] = useState<CvdMode>("none");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryTheme = params.get("theme_mode") as ThemeMode | null;
    const queryCvd = params.get("cvd_mode") as CvdMode | null;

    if (queryTheme && themeModes.some((option) => option.id === queryTheme)) {
      setThemeMode(queryTheme);
    }
    if (queryCvd && cvdModes.some((option) => option.id === queryCvd)) {
      setCvdMode(queryCvd);
    }
    if (queryTheme || queryCvd) {
      return;
    }

    const legacyQuery = params.get("visual_mode");
    const legacyQueryParsed = parseLegacyVisualMode(legacyQuery);
    if (legacyQueryParsed) {
      setThemeMode(legacyQueryParsed.themeMode);
      setCvdMode(legacyQueryParsed.cvdMode);
      return;
    }

    const storedTheme = window.localStorage.getItem(themeStorageKey) as ThemeMode | null;
    const storedCvd = window.localStorage.getItem(cvdStorageKey) as CvdMode | null;

    if (storedTheme && themeModes.some((option) => option.id === storedTheme)) {
      setThemeMode(storedTheme);
    }
    if (storedCvd && cvdModes.some((option) => option.id === storedCvd)) {
      setCvdMode(storedCvd);
    }

    if (!storedTheme && !storedCvd) {
      const legacyStored = parseLegacyVisualMode(window.localStorage.getItem(legacyStorageKey));
      if (legacyStored) {
        setThemeMode(legacyStored.themeMode);
        setCvdMode(legacyStored.cvdMode);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(themeStorageKey, themeMode);
    window.localStorage.setItem(cvdStorageKey, cvdMode);

    for (const className of Array.from(document.body.classList)) {
      if (className.startsWith("theme-") || className.startsWith("cvd-")) {
        document.body.classList.remove(className);
      }
    }
    document.body.classList.add(`theme-${themeMode}`);
    if (cvdMode !== "none") {
      document.body.classList.add(`cvd-${cvdMode}`);
    }
  }, [themeMode, cvdMode]);

  const value = useMemo<VisualModeContextValue>(
    () => ({
      themeMode,
      setThemeMode,
      cvdMode,
      setCvdMode,
      themeModes,
      cvdModes,
      enabled: flags.enableAccessibilityThemes
    }),
    [themeMode, cvdMode, flags.enableAccessibilityThemes]
  );

  return <VisualModeContext.Provider value={value}>{children}</VisualModeContext.Provider>;
}

export function useVisualMode() {
  const context = useContext(VisualModeContext);
  if (!context) {
    throw new Error("useVisualMode must be used within VisualModeProvider");
  }
  return context;
}
