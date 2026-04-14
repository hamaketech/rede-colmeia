import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RequireAuth } from "../src/app/RequireAuth";
import { LanguageProvider } from "../src/lib/i18n/LanguageProvider";
import { vi } from "vitest";

const whoAmIMock = vi.fn();

vi.mock("../src/lib/api/auth", () => ({
  whoAmI: (...args: unknown[]) => whoAmIMock(...args)
}));

describe("RequireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders protected content when session is valid", async () => {
    whoAmIMock.mockResolvedValue({ actor: { email: "contributor@redecolmeia.dev", role: "contributor" } });

    render(
      <LanguageProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <div>dashboard-content</div>
                </RequireAuth>
              }
            />
            <Route path="/auth" element={<div>auth-page</div>} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("dashboard-content")).toBeInTheDocument();
    });
  });

  it("redirects to auth when session is invalid", async () => {
    whoAmIMock.mockRejectedValue(new Error("unauthorized"));

    render(
      <LanguageProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <div>dashboard-content</div>
                </RequireAuth>
              }
            />
            <Route path="/auth" element={<div>auth-page</div>} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("auth-page")).toBeInTheDocument();
    });
  });
});
