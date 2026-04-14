export type FeatureFlags = {
  enableLandingABTest: boolean;
  enableAccessibilityThemes: boolean;
};

function parseFlag(value: string | undefined, fallback: boolean) {
  if (value == null) {
    return fallback;
  }
  const normalized = value.toLowerCase().trim();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return fallback;
}

function parseQueryFlag(name: string) {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(name);
  if (value == null) {
    return undefined;
  }
  return parseFlag(value, false);
}

export function getFeatureFlags(): FeatureFlags {
  const landingQuery = parseQueryFlag("ff_landing_ab");
  const a11yQuery = parseQueryFlag("ff_a11y_themes");

  return {
    enableLandingABTest:
      landingQuery ??
      parseFlag(import.meta.env.VITE_ENABLE_LANDING_AB_TEST as string | undefined, false),
    enableAccessibilityThemes:
      a11yQuery ??
      parseFlag(import.meta.env.VITE_ENABLE_ACCESSIBILITY_THEMES as string | undefined, true)
  };
}
