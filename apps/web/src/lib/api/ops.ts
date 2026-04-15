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

export type PartnerWorkflowSummary = {
  active: number;
  pending: number;
  paused: number;
  regions: number;
};

export type BeneficiaryWorkflowSummary = {
  quickValidation: number;
  validated: number;
  familySize1To2: number;
  familySize3To4: number;
  familySize5OrMore: number;
};

export type DistributionWorkflowSummary = {
  planned: number;
  inProgress: number;
  confirmed: number;
  confirmedBaskets: number;
};

export type PartnerWorkflowItem = {
  id: string;
  name: string;
  region: string;
  status: string;
  capacityMonthlyBaskets: number;
};

export type BeneficiaryWorkflowItem = {
  id: string;
  region: string;
  validationLevel: string;
  lastDeliveryAt?: string;
};

export type DistributionWorkflowItem = {
  id: string;
  partnerId: string;
  region: string;
  status: string;
  baskets: number;
  scheduledAt?: string;
  confirmedAt?: string;
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

type PartnerWorkflowSummaryResponse = {
  summary: PartnerWorkflowSummary;
};

type BeneficiaryWorkflowSummaryResponse = {
  summary: BeneficiaryWorkflowSummary;
};

type DistributionWorkflowSummaryResponse = {
  summary: DistributionWorkflowSummary;
};

type PartnerWorkflowListResponse = {
  items: PartnerWorkflowItem[];
  page: number;
  pageSize: number;
};

type BeneficiaryWorkflowListResponse = {
  items: BeneficiaryWorkflowItem[];
  page: number;
  pageSize: number;
};

type DistributionWorkflowListResponse = {
  items: DistributionWorkflowItem[];
  page: number;
  pageSize: number;
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

export function getPartnerWorkflowSummary() {
  return apiGet<PartnerWorkflowSummaryResponse>("/api/v1/partners/summary");
}

export function getBeneficiaryWorkflowSummary() {
  return apiGet<BeneficiaryWorkflowSummaryResponse>("/api/v1/beneficiaries/summary");
}

export function getDistributionWorkflowSummary() {
  return apiGet<DistributionWorkflowSummaryResponse>("/api/v1/distributions/summary");
}

export function getPartnersWorkflowList(page = 1, pageSize = 20) {
  return apiGet<PartnerWorkflowListResponse>(`/api/v1/partners?page=${page}&pageSize=${pageSize}`);
}

export function getBeneficiariesWorkflowList(page = 1, pageSize = 20) {
  return apiGet<BeneficiaryWorkflowListResponse>(`/api/v1/beneficiaries?page=${page}&pageSize=${pageSize}`);
}

export function getDistributionsWorkflowList(page = 1, pageSize = 20) {
  return apiGet<DistributionWorkflowListResponse>(`/api/v1/distributions?page=${page}&pageSize=${pageSize}`);
}
