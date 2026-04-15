import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { LanguageProvider } from "../src/lib/i18n/LanguageProvider";
import { BeneficiariesDrilldownPage } from "../src/features/workflow/BeneficiariesDrilldownPage";
import { DistributionsDrilldownPage } from "../src/features/workflow/DistributionsDrilldownPage";
import { PartnersDrilldownPage } from "../src/features/workflow/PartnersDrilldownPage";

const usePartnersWorkflowListMock = vi.fn();
const useBeneficiariesWorkflowListMock = vi.fn();
const useDistributionsWorkflowListMock = vi.fn();

vi.mock("../src/hooks/useWorkflowLists", () => ({
  usePartnersWorkflowList: () => usePartnersWorkflowListMock(),
  useBeneficiariesWorkflowList: () => useBeneficiariesWorkflowListMock(),
  useDistributionsWorkflowList: () => useDistributionsWorkflowListMock()
}));

describe("Workflow drilldown pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePartnersWorkflowListMock.mockReturnValue({
      loading: false,
      error: null,
      items: [
        { id: "partner-1", name: "Centro Comunitario Norte", region: "Norte", status: "active", capacityMonthlyBaskets: 160 }
      ]
    });
    useBeneficiariesWorkflowListMock.mockReturnValue({
      loading: false,
      error: null,
      items: [{ id: "benef-1", region: "Norte", validationLevel: "validated", lastDeliveryAt: "2026-04-14T10:00:00Z" }]
    });
    useDistributionsWorkflowListMock.mockReturnValue({
      loading: false,
      error: null,
      items: [{ id: "dist-1", partnerId: "partner-1", region: "Norte", status: "confirmed", baskets: 30 }]
    });
  });

  it("renders partners drilldown list", () => {
    render(
      <LanguageProvider>
        <MemoryRouter>
          <PartnersDrilldownPage />
        </MemoryRouter>
      </LanguageProvider>
    );
    expect(screen.getByText("Drilldown de parceiros")).toBeInTheDocument();
    expect(screen.getByText("Centro Comunitario Norte")).toBeInTheDocument();
  });

  it("renders beneficiaries drilldown list", () => {
    render(
      <LanguageProvider>
        <MemoryRouter>
          <BeneficiariesDrilldownPage />
        </MemoryRouter>
      </LanguageProvider>
    );
    expect(screen.getByText("Drilldown de beneficiarios")).toBeInTheDocument();
    expect(screen.getByText("benef-1")).toBeInTheDocument();
  });

  it("renders distributions drilldown list", () => {
    render(
      <LanguageProvider>
        <MemoryRouter>
          <DistributionsDrilldownPage />
        </MemoryRouter>
      </LanguageProvider>
    );
    expect(screen.getByText("Drilldown de distribuicoes")).toBeInTheDocument();
    expect(screen.getByText("dist-1")).toBeInTheDocument();
  });
});
