import { useEffect, useState } from "react";
import {
  getContributionSummary,
  getOperationalIndicators,
  getTransparencySummary,
  type ContributionSummary,
  type OperationalIndicators,
  type TransparencySummary
} from "@/lib/api/ops";

type LoadState = "idle" | "loading" | "ready" | "error";

export function useOpsMetrics() {
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transparencySummary, setTransparencySummary] = useState<TransparencySummary | null>(null);
  const [indicators, setIndicators] = useState<OperationalIndicators | null>(null);
  const [contributionSummary, setContributionSummary] = useState<ContributionSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    Promise.all([getTransparencySummary(), getOperationalIndicators(), getContributionSummary()])
      .then(([transparencyData, indicatorsData, contributionData]) => {
        if (cancelled) {
          return;
        }
        setTransparencySummary(transparencyData.summary);
        setIndicators(indicatorsData.indicators);
        setContributionSummary(contributionData.summary);
        setError(null);
        setState("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : "could not load ops metrics");
        setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    state,
    error,
    transparencySummary,
    indicators,
    contributionSummary
  };
}
