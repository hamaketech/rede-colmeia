import { fireEvent, render, screen } from "@testing-library/react";
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

describe("Visual mode switch", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.body.className = "";
  });

  it("starts in light mode and applies body class", () => {
    renderLayout();
    expect(document.body.classList.contains("theme-light")).toBe(true);
  });

  it("switches to dark mode and persists mode", () => {
    renderLayout();
    fireEvent.change(screen.getByRole("combobox", { name: "Visual" }), {
      target: { value: "dark" }
    });

    expect(window.localStorage.getItem("rede-colmeia-theme-mode")).toBe("dark");
    expect(document.body.classList.contains("theme-dark")).toBe(true);
  });

  it("switches to protanopia filter", () => {
    renderLayout();
    fireEvent.change(screen.getByRole("combobox", { name: "Filtro CVD" }), {
      target: { value: "protanopia" }
    });

    expect(window.localStorage.getItem("rede-colmeia-cvd-mode")).toBe("protanopia");
    expect(document.body.classList.contains("cvd-protanopia")).toBe(true);
  });

  it("switches to deuteranopia filter", () => {
    renderLayout();
    fireEvent.change(screen.getByRole("combobox", { name: "Filtro CVD" }), {
      target: { value: "deuteranopia" }
    });

    expect(window.localStorage.getItem("rede-colmeia-cvd-mode")).toBe("deuteranopia");
    expect(document.body.classList.contains("cvd-deuteranopia")).toBe(true);
  });

  it("switches to tritanopia filter", () => {
    renderLayout();
    fireEvent.change(screen.getByRole("combobox", { name: "Filtro CVD" }), {
      target: { value: "tritanopia" }
    });

    expect(window.localStorage.getItem("rede-colmeia-cvd-mode")).toBe("tritanopia");
    expect(document.body.classList.contains("cvd-tritanopia")).toBe(true);
  });

  it("can turn off color vision filter", () => {
    renderLayout();
    const cvdSelect = screen.getByRole("combobox", { name: "Filtro CVD" });
    fireEvent.change(cvdSelect, {
      target: { value: "protanopia" }
    });
    fireEvent.change(cvdSelect, {
      target: { value: "none" }
    });

    expect(window.localStorage.getItem("rede-colmeia-cvd-mode")).toBe("none");
    expect(document.body.classList.contains("cvd-protanopia")).toBe(false);
  });
});
