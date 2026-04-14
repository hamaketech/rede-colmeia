import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppLayout } from "../src/app/AppLayout";
import { LanguageProvider } from "../src/lib/i18n/LanguageProvider";
import { VisualModeProvider } from "../src/lib/theme/VisualModeProvider";

function renderLayout() {
  return render(
    <LanguageProvider>
      <VisualModeProvider>
        <MemoryRouter>
          <AppLayout />
        </MemoryRouter>
      </VisualModeProvider>
    </LanguageProvider>
  );
}

describe("Language switch", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to Portuguese and keeps priority order", () => {
    renderLayout();

    const languageSelect = screen.getByRole("combobox", { name: "Idioma" }) as HTMLSelectElement;
    const options = Array.from(languageSelect.options).map((option) => option.value);

    expect(languageSelect.value).toBe("pt");
    expect(options).toEqual(["pt", "es", "en"]);
    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });

  it("switches language and persists selection", async () => {
    renderLayout();

    fireEvent.change(screen.getByRole("combobox", { name: "Idioma" }), {
      target: { value: "es" }
    });

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

    expect((screen.getByRole("combobox", { name: "Language" }) as HTMLSelectElement).value).toBe(
      "en"
    );
    expect(document.documentElement.lang).toBe("en");
  });
});
