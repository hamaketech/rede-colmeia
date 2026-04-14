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
    fireEvent.click(screen.getByRole("button", { name: "Dark" }));

    expect(window.localStorage.getItem("rede-colmeia-theme-mode")).toBe("dark");
    expect(document.body.classList.contains("theme-dark")).toBe(true);
  });

  it("switches to protanopia filter", () => {
    renderLayout();
    fireEvent.click(screen.getByRole("button", { name: "Protanopia" }));

    expect(window.localStorage.getItem("rede-colmeia-cvd-mode")).toBe("protanopia");
    expect(document.body.classList.contains("cvd-protanopia")).toBe(true);
  });

  it("switches to deuteranopia filter", () => {
    renderLayout();
    fireEvent.click(screen.getByRole("button", { name: "Deuteranopia" }));

    expect(window.localStorage.getItem("rede-colmeia-cvd-mode")).toBe("deuteranopia");
    expect(document.body.classList.contains("cvd-deuteranopia")).toBe(true);
  });

  it("switches to tritanopia filter", () => {
    renderLayout();
    fireEvent.click(screen.getByRole("button", { name: "Tritanopia" }));

    expect(window.localStorage.getItem("rede-colmeia-cvd-mode")).toBe("tritanopia");
    expect(document.body.classList.contains("cvd-tritanopia")).toBe(true);
  });

  it("can turn off color vision filter", () => {
    renderLayout();
    fireEvent.click(screen.getByRole("button", { name: "Protanopia" }));
    fireEvent.click(screen.getByRole("button", { name: "No CVD filter" }));

    expect(window.localStorage.getItem("rede-colmeia-cvd-mode")).toBe("none");
    expect(document.body.classList.contains("cvd-protanopia")).toBe(false);
  });
});
