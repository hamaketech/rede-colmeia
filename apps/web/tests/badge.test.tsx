import { render, screen } from "@testing-library/react";
import { Badge } from "../src/components/ui/badge";

describe("Badge status patterns", () => {
  it("renders a non-color symbol for success variant", () => {
    render(<Badge variant="success">ok</Badge>);
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("renders a non-color symbol for warning variant", () => {
    render(<Badge variant="warning">warning</Badge>);
    expect(screen.getByText("!")).toBeInTheDocument();
  });

  it("renders a non-color symbol for error variant", () => {
    render(<Badge variant="error">error</Badge>);
    expect(screen.getByText("✕")).toBeInTheDocument();
  });
});
