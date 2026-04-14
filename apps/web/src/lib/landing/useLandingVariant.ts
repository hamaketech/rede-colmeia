import { useEffect, useMemo, useState } from "react";
import { getFeatureFlags } from "@/lib/flags/featureFlags";

export type LandingVariant = "default" | "campaign-dark";

const storageKey = "rede-colmeia-landing-variant";

function readQueryVariant() {
  const value = new URLSearchParams(window.location.search).get("landing_variant");
  if (value === "default" || value === "campaign-dark") {
    return value;
  }
  return null;
}

function selectRandomVariant() {
  return Math.random() < 0.5 ? "default" : "campaign-dark";
}

export function useLandingVariant() {
  const flags = getFeatureFlags();
  const [variant, setVariant] = useState<LandingVariant>("default");

  useEffect(() => {
    if (!flags.enableLandingABTest) {
      setVariant("default");
      return;
    }

    const queryVariant = readQueryVariant();
    if (queryVariant) {
      setVariant(queryVariant);
      window.localStorage.setItem(storageKey, queryVariant);
      return;
    }

    const stored = window.localStorage.getItem(storageKey) as LandingVariant | null;
    if (stored === "default" || stored === "campaign-dark") {
      setVariant(stored);
      return;
    }

    const assigned = selectRandomVariant();
    setVariant(assigned);
    window.localStorage.setItem(storageKey, assigned);
  }, [flags.enableLandingABTest]);

  return useMemo(
    () => ({
      variant,
      abTestEnabled: flags.enableLandingABTest
    }),
    [variant, flags.enableLandingABTest]
  );
}
