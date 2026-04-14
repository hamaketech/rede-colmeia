import { apiGet } from "./client";

export type TransparencySummary = {
  contributors: number;
  partners: number;
  familiesSupported: number;
  totalRaisedCents: number;
  basketsDelivered: number;
  regionsServed: number;
  lastUpdated: string;
};

export type OperationalIndicators = {
  deliveryCoverageRate: number;
  contributorActivationRate: number;
  averageResponseHours: number;
  pipeline: {
    queued: number;
    preparing: number;
    inDelivery: number;
    delivered: number;
  };
  lastUpdated: string;
};

export type ContributionSummary = {
  activeSubscriptions: number;
  totalMonthlyCents: number;
  totalCapturedCents: number;
  estimatedBasketsPerMonth: number;
};

type TransparencySummaryResponse = {
  summary: TransparencySummary;
};

type IndicatorsResponse = {
  indicators: OperationalIndicators;
};

type ContributionSummaryResponse = {
  summary: ContributionSummary;
};

export function getTransparencySummary() {
  return apiGet<TransparencySummaryResponse>("/api/v1/ops/transparency/summary");
}

export function getOperationalIndicators() {
  return apiGet<IndicatorsResponse>("/api/v1/ops/indicators");
}

export function getContributionSummary() {
  return apiGet<ContributionSummaryResponse>("/api/v1/ops/subscriptions/summary");
}
