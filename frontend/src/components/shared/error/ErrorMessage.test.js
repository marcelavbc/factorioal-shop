import React from "react";
import { render, screen } from "@testing-library/react";
import ErrorMessage from "./ErrorMessage";

describe("ErrorMessage Component", () => {
  it("renders the provided error message", () => {
    render(<ErrorMessage message="This is an error!" />);

    expect(screen.getByRole("alert")).toHaveTextContent("This is an error!");
  });

  it("displays default message when no message is provided", () => {
    render(<ErrorMessage />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Something went wrong. Please try again."
    );
  });

  it("has the correct Bootstrap alert class", () => {
    render(<ErrorMessage message="Test error" />);

    const alertDiv = screen.getByRole("alert");
    expect(alertDiv).toHaveClass("alert alert-danger text-center");
  });
});
