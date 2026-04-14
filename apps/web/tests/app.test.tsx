import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppLayout } from "../src/app/AppLayout";
import { LanguageProvider } from "../src/lib/i18n/LanguageProvider";
import { VisualModeProvider } from "../src/lib/theme/VisualModeProvider";
import { vi } from "vitest";

const whoAmIMock = vi.fn();
const logoutMock = vi.fn();

vi.mock("../src/lib/api/auth", () => ({
  whoAmI: (...args: unknown[]) => whoAmIMock(...args),
  logout: (...args: unknown[]) => logoutMock(...args)
}));

describe("AppLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logoutMock.mockResolvedValue({ message: "ok" });
  });

  it("renders public navigation on landing context", () => {
    whoAmIMock.mockRejectedValue(new Error("unauthorized"));
    render(
      <LanguageProvider>
        <VisualModeProvider>
          <MemoryRouter initialEntries={["/"]}>
            <AppLayout />
          </MemoryRouter>
        </VisualModeProvider>
      </LanguageProvider>
    );

    expect(screen.getByText("Rede Colmeia")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Painel" })).not.toBeInTheDocument();
  });

  it("renders dedicated workspace navigation on dashboard context", async () => {
    whoAmIMock.mockResolvedValue({ actor: { email: "admin@redecolmeia.dev", role: "admin" } });
    render(
      <LanguageProvider>
        <VisualModeProvider>
          <MemoryRouter initialEntries={["/dashboard"]}>
            <AppLayout />
          </MemoryRouter>
        </VisualModeProvider>
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByRole("link", { name: "Painel" }).length).toBeGreaterThan(0);
      expect(screen.getByRole("link", { name: "Seguranca" })).toBeInTheDocument();
      expect(screen.getByText(/Area logada/i)).toBeInTheDocument();
    });
  });
});
