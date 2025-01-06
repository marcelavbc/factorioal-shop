import React from "react";
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";
import { ToastContainer } from "react-toastify";
import AdminBicycles from "./AdminBicycles";
import {
  createBicycle,
  getBicycles,
  getPartOptions,
  updateBicycle,
} from "../../../api/api";

// Mock the API functions
jest.mock("../../../api/api");

describe("AdminBicycles Component", () => {
  const mockBicycles = [
    {
      _id: "bike-1",
      name: "Speedster",
      description: "Fast road bike",
      price: 1500,
      partOptions: ["frame-carbon", "brakes-disc"],
    },
    {
      _id: "bike-2",
      name: "Mountain King",
      description: "Durable mountain bike",
      price: 2000,
      partOptions: ["frame-aluminum", "brakes-v"],
    },
  ];

  const mockPartOptions = [
    { _id: "frame-carbon", category: "Frame", value: "Carbon" },
    { _id: "brakes-disc", category: "Brakes", value: "Disc" },
    { _id: "frame-aluminum", category: "Frame", value: "Aluminum" },
    { _id: "brakes-v", category: "Brakes", value: "V-Brake" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    getBicycles.mockResolvedValue(mockBicycles);
    getPartOptions.mockResolvedValue(mockPartOptions);
  });

  it("renders the bicycles list", async () => {
    render(
      <>
        <AdminBicycles />
        <ToastContainer />
      </>
    );

    expect(await screen.findByText("Manage Bicycles")).toBeInTheDocument();
    expect(screen.getByText("Speedster")).toBeInTheDocument();
    expect(screen.getByText("Mountain King")).toBeInTheDocument();
  });

  it("opens the modal when 'Add New Bicycle' button is clicked", async () => {
    render(<AdminBicycles />);

    await screen.findByText("Manage Bicycles");

    const addButton = screen.getByRole("button", { name: /add new bicycle/i });

    fireEvent.click(addButton);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
  it("displays the correct modal content when 'Add New Bicycle' is clicked", async () => {
    render(<AdminBicycles />);

    await screen.findByText("Manage Bicycles");

    fireEvent.click(screen.getByRole("button", { name: /add new bicycle/i }));

    const modal = await screen.findByRole("dialog");

    expect(within(modal).getByText("Add New Bicycle")).toBeInTheDocument();

    expect(within(modal).getByLabelText(/name/i)).toBeInTheDocument();
    expect(within(modal).getByLabelText(/description/i)).toBeInTheDocument();
    expect(within(modal).getByLabelText(/price/i)).toBeInTheDocument();
    expect(within(modal).getByLabelText(/image/i)).toBeInTheDocument();
  });
  it("calls createBicycle when a new bicycle is added", async () => {
    createBicycle.mockResolvedValue({
      _id: "bike-3",
      name: "Roadster",
      description: "Lightweight road bike",
      price: 1800,
      partOptions: ["frame-carbon", "brakes-disc"],
    });

    render(<AdminBicycles />);

    await screen.findByText("Manage Bicycles");

    fireEvent.click(screen.getByRole("button", { name: /add new bicycle/i }));

    const modal = await screen.findByRole("dialog");
    expect(modal).toBeInTheDocument();

    fireEvent.change(within(modal).getByLabelText(/name/i), {
      target: { value: "Roadster" },
    });
    fireEvent.change(within(modal).getByLabelText(/description/i), {
      target: { value: "Lightweight road bike" },
    });
    fireEvent.change(within(modal).getByLabelText(/price/i), {
      target: { value: "1800" },
    });

    fireEvent.click(within(modal).getByRole("checkbox", { name: /Carbon/i }));
    fireEvent.click(within(modal).getByRole("checkbox", { name: /Disc/i }));

    fireEvent.click(within(modal).getByRole("button", { name: /^add$/i }));

    await waitFor(() => {
      expect(createBicycle).toHaveBeenCalledWith({
        name: "Roadster",
        description: "Lightweight road bike",
        price: 1800,
        image: "",
        partOptions: ["frame-carbon", "brakes-disc"],
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Roadster")).toBeInTheDocument();
    });
  });
  it("opens the modal and pre-fills form fields when editing a bicycle", async () => {
    render(<AdminBicycles />);

    await screen.findByText("Manage Bicycles");

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    const modal = await screen.findByRole("dialog");

    expect(within(modal).getByText("Edit Bicycle")).toBeInTheDocument();

    expect(within(modal).getByDisplayValue("Speedster")).toBeInTheDocument();
    expect(
      within(modal).getByDisplayValue("Fast road bike")
    ).toBeInTheDocument();
    expect(within(modal).getByDisplayValue("1500")).toBeInTheDocument();
  });
  it("calls updateBicycle when editing a bicycle", async () => {
    updateBicycle.mockResolvedValue({
      _id: "bike-1",
      name: "Speedster Pro",
      description: "Upgraded road bike",
      price: 1600,
      partOptions: ["frame-carbon", "brakes-disc"],
    });

    render(<AdminBicycles />);

    await screen.findByText("Manage Bicycles");

    fireEvent.click(screen.getAllByText("Edit")[0]);

    const modal = await screen.findByRole("dialog");

    fireEvent.change(within(modal).getByLabelText(/name/i), {
      target: { value: "Speedster Pro" },
    });
    fireEvent.change(within(modal).getByLabelText(/description/i), {
      target: { value: "Upgraded road bike" },
    });
    fireEvent.change(within(modal).getByLabelText(/price/i), {
      target: { value: "1600" },
    });

    fireEvent.click(within(modal).getByRole("button", { name: /^update$/i }));

    await waitFor(() => {
      expect(updateBicycle).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(updateBicycle).toHaveBeenCalledWith("bike-1", {
        name: "Speedster Pro",
        description: "Upgraded road bike",
        price: 1600,
        image: "",
        partOptions: ["frame-carbon", "brakes-disc"],
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Speedster Pro")).toBeInTheDocument();
    });
  });
  it("shows an error if updating a bicycle fails", async () => {
    updateBicycle.mockRejectedValue(new Error("Network error"));

    render(
      <>
        <AdminBicycles />
        <ToastContainer />
      </>
    );

    await screen.findByText("Manage Bicycles");

    const editButtons = await screen.findAllByText("Edit");
    fireEvent.click(editButtons[0]);

    const modal = await screen.findByRole("dialog");
    expect(modal).toBeInTheDocument();

    fireEvent.change(within(modal).getByLabelText(/name/i), {
      target: { value: "Speedster Pro" },
    });

    fireEvent.click(within(modal).getByRole("button", { name: /^update$/i }));

    await waitFor(() => {
      expect(updateBicycle).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText("Failed to save bicycle.")).toBeInTheDocument();
    });
  });
  it("closes the modal when 'Close' button is clicked", async () => {
    render(<AdminBicycles />);

    await screen.findByText("Manage Bicycles");

    fireEvent.click(screen.getByRole("button", { name: /add new bicycle/i }));

    const modal = await screen.findByRole("dialog");
    expect(modal).toBeInTheDocument();

    const closeButton = within(modal).getByText("Close");

    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("does not allow submitting the form with missing fields", async () => {
    render(
      <>
        <AdminBicycles />
        <ToastContainer />
      </>
    );

    await screen.findByText("Manage Bicycles");

    fireEvent.click(screen.getByRole("button", { name: /add new bicycle/i }));

    const modal = await screen.findByRole("dialog");
    expect(modal).toBeInTheDocument();

    fireEvent.click(within(modal).getByRole("button", { name: /^add$/i }));

    await waitFor(() => {
      expect(screen.getByText("All fields are required!")).toBeInTheDocument();
    });
  });
});
