import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminModal from "./AdminModal";

describe("AdminModal Component", () => {
  it("renders correctly", () => {
    render(
      <AdminModal
        show={true}
        title="Test Modal"
        onHide={jest.fn()}
        onSave={jest.fn()}
      />
    );

    expect(screen.getByText("Test Modal")).toBeInTheDocument();
  });

  it("calls onHide when close button is clicked", () => {
    const mockOnHide = jest.fn();

    render(
      <AdminModal
        show={true}
        title="Test Modal"
        onHide={mockOnHide}
        onSave={jest.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText("Close"));

    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });

  it("calls onSave when save button is clicked", () => {
    const mockOnSave = jest.fn();

    render(
      <AdminModal
        show={true}
        title="Test Modal"
        onHide={jest.fn()}
        onSave={mockOnSave}
      />
    );

    fireEvent.click(screen.getByTestId("modal-save-button"));

    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });
});
