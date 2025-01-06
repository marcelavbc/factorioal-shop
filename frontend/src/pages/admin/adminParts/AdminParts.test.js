import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { ToastContainer } from "react-toastify";
import { MemoryRouter } from "react-router-dom";
import AdminParts from "./AdminParts";
import {
  getPartOptions,
  createPartOption,
  deletePartOption,
  updatePartOption,
} from "../../../api/api";

jest.mock("../../../api/api");

describe("AdminParts Component", () => {
  const mockPartOptions = {
    Frame: [
      {
        _id: "frame-carbon",
        category: "Frame",
        value: "Carbon",
        stock: "in_stock",
      },
      {
        _id: "frame-aluminum",
        category: "Frame",
        value: "Aluminum",
        stock: "out_of_stock",
      },
    ],
    Brakes: [
      {
        _id: "brakes-disc",
        category: "Brakes",
        value: "Disc",
        stock: "in_stock",
      },
      {
        _id: "brakes-v",
        category: "Brakes",
        value: "V-Brake",
        stock: "out_of_stock",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getPartOptions.mockResolvedValue([
      ...mockPartOptions.Frame,
      ...mockPartOptions.Brakes,
    ]);
  });

  it("renders the part options correctly", async () => {
    render(
      <MemoryRouter>
        <AdminParts />
        <ToastContainer />
      </MemoryRouter>
    );

    expect(await screen.findByText("Manage Part Options")).toBeInTheDocument();

    expect(screen.getByText("Frame")).toBeInTheDocument();
    expect(screen.getByText("Brakes")).toBeInTheDocument();

    expect(screen.getByText("Carbon (in_stock)")).toBeInTheDocument();
    expect(screen.getByText("Disc (in_stock)")).toBeInTheDocument();
  });

  it("opens the modal when 'Add' button is clicked", async () => {
    render(<AdminParts />);

    await screen.findByText("Manage Part Options");

    const addButton = screen.getByRole("button", { name: /\+ add frame/i });
    fireEvent.click(addButton);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Add New Frame")).toBeInTheDocument();
  });

  it("adds a new part option", async () => {
    createPartOption.mockResolvedValue({
      _id: "frame-steel",
      category: "Frame",
      value: "Steel",
      stock: "in_stock",
    });

    render(<AdminParts />);

    await screen.findByText("Manage Part Options");

    fireEvent.click(screen.getByRole("button", { name: /\+ add frame/i }));

    const modal = await screen.findByRole("dialog");

    fireEvent.change(within(modal).getByLabelText(/value/i), {
      target: { value: "Steel" },
    });

    fireEvent.click(
      within(modal).getByRole("button", { name: /^add frame$/i })
    );

    await waitFor(() => {
      expect(createPartOption).toHaveBeenCalledWith({
        category: "Frame",
        value: "Steel",
        stock: "in_stock",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Steel (in_stock)")).toBeInTheDocument();
    });
  });

  it("deletes a part option", async () => {
    deletePartOption.mockResolvedValue();

    render(<AdminParts />);

    await screen.findByText("Manage Part Options");

    const deleteButton = screen.getAllByText("Delete")[0];

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deletePartOption).toHaveBeenCalledWith("frame-carbon");
    });

    await waitFor(() => {
      expect(screen.queryByText("Carbon (in_stock)")).not.toBeInTheDocument();
    });
  });
  it("toggles stock status of a part option", async () => {
    updatePartOption.mockResolvedValue({
      _id: "frame-carbon",
      category: "Frame",
      value: "Carbon",
      stock: "out_of_stock",
    });

    render(<AdminParts />);

    await screen.findByText("Manage Part Options");

    const toggleButton = screen.getAllByText("Mark as Out of Stock")[0];

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(updatePartOption).toHaveBeenCalledWith("frame-carbon", {
        stock: "out_of_stock",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Carbon (out_of_stock)")).toBeInTheDocument();
    });
  });
  it("shows an error message if API call fails", async () => {
    getPartOptions.mockRejectedValue(new Error("Failed to fetch part options"));

    render(<AdminParts />);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load part options.")
      ).toBeInTheDocument();
    });
  });
});
