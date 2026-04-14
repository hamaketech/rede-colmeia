import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthPage } from "../src/features/auth/AuthPage";
import { LanguageProvider } from "../src/lib/i18n/LanguageProvider";
import { vi } from "vitest";

const loginMock = vi.fn();
const registerMock = vi.fn();
const logoutMock = vi.fn();
const logoutAllMock = vi.fn();
const rotateSessionMock = vi.fn();
const whoAmIMock = vi.fn();
const requestPasswordResetMock = vi.fn();
const confirmPasswordResetMock = vi.fn();

vi.mock("../src/lib/api/auth", () => ({
  login: (...args: unknown[]) => loginMock(...args),
  register: (...args: unknown[]) => registerMock(...args),
  logout: (...args: unknown[]) => logoutMock(...args),
  logoutAll: (...args: unknown[]) => logoutAllMock(...args),
  rotateSession: (...args: unknown[]) => rotateSessionMock(...args),
  whoAmI: (...args: unknown[]) => whoAmIMock(...args),
  requestPasswordReset: (...args: unknown[]) => requestPasswordResetMock(...args),
  confirmPasswordReset: (...args: unknown[]) => confirmPasswordResetMock(...args)
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

  it("requests password reset and applies a new password", async () => {
    requestPasswordResetMock.mockResolvedValue({
      message: "token generated",
      resetToken: "dev-token-123"
    });
    confirmPasswordResetMock.mockResolvedValue({
      message: "password reset completed"
    });

    renderPage();
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "new@redecolmeia.dev" }
    });

    fireEvent.click(screen.getByText("Ferramentas de reset"));
    fireEvent.click(screen.getByRole("button", { name: "Solicitar recuperacao" }));
    await waitFor(() => {
      expect(requestPasswordResetMock).toHaveBeenCalledWith({ email: "new@redecolmeia.dev" });
    });

    fireEvent.click(screen.getByText("Ferramentas de desenvolvimento"));
    fireEvent.change(screen.getByLabelText("Token de recuperacao"), {
      target: { value: "dev-token-123" }
    });
    fireEvent.change(screen.getByLabelText("Nova senha"), {
      target: { value: "new-pass-123" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar nova senha" }));

    await waitFor(() => {
      expect(confirmPasswordResetMock).toHaveBeenCalledWith({
        token: "dev-token-123",
        newPassword: "new-pass-123"
      });
    });
  });
});
