import React from "react";
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "./LoadingSpinner";

describe("LoadingSpinner Component", () => {
  it("renders the loading spinner", () => {
    render(<LoadingSpinner />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has the correct Bootstrap classes", () => {
    render(<LoadingSpinner />);

    const spinnerDiv = screen.getByRole("status");
    expect(spinnerDiv).toHaveClass("spinner-border");
  });

  it("includes an accessible hidden loading message", () => {
    render(<LoadingSpinner />);

    expect(screen.getByText("Loading...")).toHaveClass("visually-hidden");
  });
});
