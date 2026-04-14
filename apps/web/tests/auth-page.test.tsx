import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthPage } from "../src/features/auth/AuthPage";
import { LanguageProvider } from "../src/lib/i18n/LanguageProvider";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

const loginMock = vi.fn();
const registerMock = vi.fn();
const navigateMock = vi.fn();
let locationState: unknown = null;

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ pathname: "/auth", search: "", hash: "", key: "test", state: locationState })
  };
});

vi.mock("../src/lib/api/auth", () => ({
  login: (...args: unknown[]) => loginMock(...args),
  register: (...args: unknown[]) => registerMock(...args)
}));

function renderPage() {
  return render(
    <LanguageProvider>
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    </LanguageProvider>
  );
}

describe("Auth page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    locationState = null;
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
      expect(navigateMock).toHaveBeenCalledWith("/dashboard");
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

  it("keeps advanced controls out of auth card", () => {
    renderPage();
    expect(screen.queryByText("Ferramentas de desenvolvimento")).not.toBeInTheDocument();
    expect(screen.getByText("Recuperacao e controles avancados agora ficam em:")).toBeInTheDocument();
  });

  it("shows required-session notice when redirected from protected route", () => {
    locationState = { authReason: "required" };
    renderPage();
    expect(
      screen.getByText("Sua sessao e necessaria para acessar o painel. Entre para continuar.")
    ).toBeInTheDocument();
  });
});
