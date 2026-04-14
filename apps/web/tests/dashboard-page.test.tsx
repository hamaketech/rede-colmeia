import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DashboardPage } from "../src/features/dashboard/DashboardPage";
import { LanguageProvider } from "../src/lib/i18n/LanguageProvider";
import { vi } from "vitest";

const useHealthMock = vi.fn();

vi.mock("../src/hooks/useHealth", () => ({
  useHealth: () => useHealthMock()
}));

describe("Dashboard page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useHealthMock.mockReturnValue({ status: "ok", error: null });
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
    expect(screen.getByText("Proximas entregas")).toBeInTheDocument();
  });
});
