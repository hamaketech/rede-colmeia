import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthPage } from "../src/features/auth/AuthPage";
import { LanguageProvider } from "../src/lib/i18n/LanguageProvider";
import { vi } from "vitest";

const loginMock = vi.fn();
const registerMock = vi.fn();
const logoutMock = vi.fn();
const whoAmIMock = vi.fn();

vi.mock("../src/lib/api/auth", () => ({
  login: (...args: unknown[]) => loginMock(...args),
  register: (...args: unknown[]) => registerMock(...args),
  logout: (...args: unknown[]) => logoutMock(...args),
  whoAmI: (...args: unknown[]) => whoAmIMock(...args)
}));

function renderPage() {
  return render(
    <LanguageProvider>
      <AuthPage />
    </LanguageProvider>
  );
}

describe("Auth page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits login credentials", async () => {
    loginMock.mockResolvedValue({
      status: "ok",
      actor: { email: "admin@redecolmeia.dev", role: "admin" }
    });

    renderPage();

    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "admin@redecolmeia.dev" }
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "admin-pass" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar agora" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: "admin@redecolmeia.dev",
        password: "admin-pass"
      });
    });
  });

  it("submits registration payload when register tab is selected", async () => {
    registerMock.mockResolvedValue({
      status: "created",
      actor: { email: "new@redecolmeia.dev", role: "contributor" }
    });

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "new@redecolmeia.dev" }
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "new-pass-123" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        email: "new@redecolmeia.dev",
        password: "new-pass-123",
        role: "contributor"
      });
    });
  });

  it("shows inline password validation on register before API call", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "new@redecolmeia.dev" }
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "short" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(registerMock).not.toHaveBeenCalled();
    expect(screen.getByText("A senha precisa ter pelo menos 8 caracteres.")).toBeInTheDocument();
  });
});
