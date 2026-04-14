import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppLayout } from "../src/app/AppLayout";
import { LanguageProvider } from "../src/lib/i18n/LanguageProvider";

describe("AppLayout", () => {
  it("renders the project title", () => {
    render(
      <LanguageProvider>
        <MemoryRouter>
          <AppLayout />
        </MemoryRouter>
      </LanguageProvider>
    );

    expect(screen.getByText("Rede Colmeia")).toBeInTheDocument();
  });
});
