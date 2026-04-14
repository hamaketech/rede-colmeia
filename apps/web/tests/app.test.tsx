import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppLayout } from "../src/app/AppLayout";
import { LanguageProvider } from "../src/lib/i18n/LanguageProvider";
import { VisualModeProvider } from "../src/lib/theme/VisualModeProvider";

describe("AppLayout", () => {
  it("renders the project title", () => {
    render(
      <LanguageProvider>
        <VisualModeProvider>
          <MemoryRouter>
            <AppLayout />
          </MemoryRouter>
        </VisualModeProvider>
      </LanguageProvider>
    );

    expect(screen.getByText("Rede Colmeia")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Painel" })).toBeInTheDocument();
  });
});
