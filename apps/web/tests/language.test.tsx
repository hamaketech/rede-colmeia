import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppLayout } from "../src/app/AppLayout";
import { LanguageProvider } from "../src/lib/i18n/LanguageProvider";

function renderLayout() {
  return render(
    <LanguageProvider>
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>
    </LanguageProvider>
  );
}

describe("Language switch", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to Portuguese and keeps priority order", () => {
    renderLayout();

    const ptButton = screen.getByRole("button", { name: "Portugues" });
    const esButton = screen.getByRole("button", { name: "Espanhol" });
    const enButton = screen.getByRole("button", { name: "Ingles" });

    expect(ptButton).toHaveAttribute("aria-pressed", "true");
    expect(esButton).toHaveAttribute("aria-pressed", "false");
    expect(enButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });

  it("switches language and persists selection", async () => {
    renderLayout();

    fireEvent.click(screen.getByRole("button", { name: "Espanhol" }));

    expect(screen.getByText("Aliados")).toBeInTheDocument();
    expect(window.localStorage.getItem("rede-colmeia-language")).toBe("es");
    expect(document.documentElement.lang).toBe("es");
  });

  it("loads persisted language on mount", async () => {
    window.localStorage.setItem("rede-colmeia-language", "en");
    renderLayout();

    await waitFor(() => {
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Ingles" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(document.documentElement.lang).toBe("en");
  });
});
