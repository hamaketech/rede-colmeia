import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LandingPage } from "../src/features/landing/LandingPage";
import { LanguageProvider } from "../src/lib/i18n/LanguageProvider";
import { vi } from "vitest";

const useOpsMetricsMock = vi.fn();

vi.mock("../src/hooks/useOpsMetrics", () => ({
  useOpsMetrics: () => useOpsMetricsMock()
}));

vi.mock("../src/lib/landing/useLandingVariant", () => ({
  useLandingVariant: () => ({ variant: "default", abTestEnabled: false })
}));

describe("Landing page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders live transparency metrics when available", () => {
    useOpsMetricsMock.mockReturnValue({
      transparencySummary: {
        contributors: 480,
        partners: 33,
        familiesSupported: 1204
      }
    });

    render(
      <LanguageProvider>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </LanguageProvider>
    );

    expect(screen.getByText("480")).toBeInTheDocument();
    expect(screen.getByText("33")).toBeInTheDocument();
    expect(screen.getByText("1,204")).toBeInTheDocument();
  });

  it("renders fallback metrics when live data is unavailable", () => {
    useOpsMetricsMock.mockReturnValue({
      transparencySummary: null
    });

    render(
      <LanguageProvider>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </LanguageProvider>
    );

    expect(screen.getAllByText("--").length).toBeGreaterThanOrEqual(3);
  });
});
