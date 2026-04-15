import { useEffect, useState } from "react";
import {
  getBeneficiaryWorkflowSummary,
  getContributionSummary,
  getDistributionWorkflowSummary,
  getOperationalIndicators,
  getPartnerWorkflowSummary,
  getTransparencySummary,
  type BeneficiaryWorkflowSummary,
  type ContributionSummary,
  type DistributionWorkflowSummary,
  type OperationalIndicators,
  type PartnerWorkflowSummary,
  type TransparencySummary
} from "@/lib/api/ops";

type LoadState = "idle" | "loading" | "ready" | "error";

export function useOpsMetrics() {
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transparencySummary, setTransparencySummary] = useState<TransparencySummary | null>(null);
  const [indicators, setIndicators] = useState<OperationalIndicators | null>(null);
  const [contributionSummary, setContributionSummary] = useState<ContributionSummary | null>(null);
  const [partnerWorkflowSummary, setPartnerWorkflowSummary] = useState<PartnerWorkflowSummary | null>(null);
  const [beneficiaryWorkflowSummary, setBeneficiaryWorkflowSummary] = useState<BeneficiaryWorkflowSummary | null>(null);
  const [distributionWorkflowSummary, setDistributionWorkflowSummary] = useState<DistributionWorkflowSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    Promise.all([
      getTransparencySummary(),
      getOperationalIndicators(),
      getContributionSummary(),
      getPartnerWorkflowSummary(),
      getBeneficiaryWorkflowSummary(),
      getDistributionWorkflowSummary()
    ]).then(
      ([
        transparencyData,
        indicatorsData,
        contributionData,
        partnerWorkflowData,
        beneficiaryWorkflowData,
        distributionWorkflowData
      ]) => {
        if (cancelled) {
          return;
        }
        setTransparencySummary(transparencyData.summary);
        setIndicators(indicatorsData.indicators);
        setContributionSummary(contributionData.summary);
        setPartnerWorkflowSummary(partnerWorkflowData.summary);
        setBeneficiaryWorkflowSummary(beneficiaryWorkflowData.summary);
        setDistributionWorkflowSummary(distributionWorkflowData.summary);
        setError(null);
        setState("ready");
      }
    )
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
    contributionSummary,
    partnerWorkflowSummary,
    beneficiaryWorkflowSummary,
    distributionWorkflowSummary
  };
}
