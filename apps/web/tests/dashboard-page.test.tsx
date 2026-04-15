import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DashboardPage } from "../src/features/dashboard/DashboardPage";
import { LanguageProvider } from "../src/lib/i18n/LanguageProvider";
import { vi } from "vitest";

const useHealthMock = vi.fn();
const useOpsMetricsMock = vi.fn();

vi.mock("../src/hooks/useHealth", () => ({
  useHealth: () => useHealthMock()
}));

vi.mock("../src/hooks/useOpsMetrics", () => ({
  useOpsMetrics: () => useOpsMetricsMock()
}));

describe("Dashboard page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useHealthMock.mockReturnValue({ status: "ok", error: null });
    useOpsMetricsMock.mockReturnValue({
      state: "ready",
      error: null,
      transparencySummary: {
        contributors: 321,
        partners: 22,
        familiesSupported: 701,
        totalRaisedCents: 3500000,
        basketsDelivered: 188,
        regionsServed: 7,
        lastUpdated: "2026-04-13T10:00:00Z"
      },
      indicators: {
        deliveryCoverageRate: 90,
        contributorActivationRate: 76,
        averageResponseHours: 16,
        pipeline: {
          queued: 11,
          preparing: 8,
          inDelivery: 6,
          delivered: 42
        },
        lastUpdated: "2026-04-13T10:00:00Z"
      },
      contributionSummary: {
        activeSubscriptions: 321,
        totalMonthlyCents: 2120000,
        totalCapturedCents: 8910000,
        estimatedBasketsPerMonth: 605
      },
      partnerWorkflowSummary: {
        active: 12,
        pending: 2,
        paused: 1,
        regions: 4
      },
      beneficiaryWorkflowSummary: {
        quickValidation: 32,
        validated: 24,
        familySize1To2: 10,
        familySize3To4: 9,
        familySize5OrMore: 5
      },
      distributionWorkflowSummary: {
        planned: 8,
        inProgress: 3,
        confirmed: 11,
        confirmedBaskets: 240
      }
    });
  });

  it("renders contributor dashboard sections", () => {
    render(
      <LanguageProvider>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </LanguageProvider>
    );

    expect(screen.getByText("Uma visao clara da sua contribuicao e dos proximos passos da rede.")).toBeInTheDocument();
    expect(screen.getByText("Contribuintes ativos")).toBeInTheDocument();
    expect(screen.getByText("Acoes rapidas")).toBeInTheDocument();
    expect(screen.getByText("Fluxo de execucao (fase 5)")).toBeInTheDocument();
    expect(screen.getByText("Proximas entregas")).toBeInTheDocument();
    expect(screen.getByText("321")).toBeInTheDocument();
  });
});
