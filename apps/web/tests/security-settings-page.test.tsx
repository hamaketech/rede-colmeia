import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { SecuritySettingsPage } from "../src/features/settings/SecuritySettingsPage";
import { LanguageProvider } from "../src/lib/i18n/LanguageProvider";

const whoAmIMock = vi.fn();
const listSessionsMock = vi.fn();
const revokeSessionByIDMock = vi.fn();
const requestPasswordResetMock = vi.fn();

vi.mock("../src/lib/api/auth", () => ({
  whoAmI: (...args: unknown[]) => whoAmIMock(...args),
  listSessions: (...args: unknown[]) => listSessionsMock(...args),
  revokeSessionByID: (...args: unknown[]) => revokeSessionByIDMock(...args),
  requestPasswordReset: (...args: unknown[]) => requestPasswordResetMock(...args),
  logout: vi.fn().mockResolvedValue({ message: "ok" }),
  logoutAll: vi.fn().mockResolvedValue({ message: "ok" }),
  rotateSession: vi.fn().mockResolvedValue({ message: "ok" }),
  confirmPasswordReset: vi.fn().mockResolvedValue({ message: "ok" })
}));

function renderPage() {
  return render(
    <LanguageProvider>
      <MemoryRouter>
        <SecuritySettingsPage />
      </MemoryRouter>
    </LanguageProvider>
  );
}

describe("Security settings page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    whoAmIMock.mockResolvedValue({ actor: { email: "contributor@redecolmeia.dev", role: "contributor" } });
    listSessionsMock.mockResolvedValue({
      sessions: [
        {
          id: "session-current",
          role: "contributor",
          expiresAt: "2026-04-15T10:00:00Z",
          isCurrent: true,
          isActive: true
        },
        {
          id: "session-other",
          role: "contributor",
          expiresAt: "2026-04-15T09:00:00Z",
          isCurrent: false,
          isActive: true
        }
      ]
    });
    requestPasswordResetMock.mockResolvedValue({ message: "ok", resetToken: "dev-reset-token" });
    revokeSessionByIDMock.mockResolvedValue({ message: "session revoked" });
  });

  it("loads actor sessions and revokes selected session", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("session-current")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Revogar sessao" }));
    await waitFor(() => {
      expect(revokeSessionByIDMock).toHaveBeenCalledWith({ sessionId: "session-other" });
    });
  });

  it("requests recovery from settings page", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Solicitar recuperacao" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Solicitar recuperacao" }));
    await waitFor(() => {
      expect(requestPasswordResetMock).toHaveBeenCalledWith({ email: "contributor@redecolmeia.dev" });
    });
  });
});
