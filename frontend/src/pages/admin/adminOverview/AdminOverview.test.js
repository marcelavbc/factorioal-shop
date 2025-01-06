import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminOverview from "./AdminOverview";
import { getBicycles, getPartOptions } from "../../../api/api";

jest.mock("../../../api/api");

describe("AdminOverview Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading spinner initially", async () => {
    getBicycles.mockResolvedValue([]);
    getPartOptions.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <AdminOverview />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });
  it("renders dashboard data when API call succeeds", async () => {
    getBicycles.mockResolvedValue([
      { _id: "bike-1", name: "Speedster" },
      { _id: "bike-2", name: "Mountain King" },
    ]);
    getPartOptions.mockResolvedValue([
      { _id: "option-1", category: "Frame", value: "Carbon" },
      { _id: "option-2", category: "Brakes", value: "Disc" },
      { _id: "option-3", category: "Frame", value: "Aluminum" },
    ]);

    render(
      <MemoryRouter>
        <AdminOverview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Total Bicycles")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Total Part Options")).toBeInTheDocument();
    });
  });
  it("shows an error message if API call fails", async () => {
    getBicycles.mockRejectedValue(new Error("Failed to fetch bicycles"));
    getPartOptions.mockRejectedValue(new Error("Failed to fetch part options"));

    render(
      <MemoryRouter>
        <AdminOverview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load dashboard statistics.")
      ).toBeInTheDocument();
    });
  });
  it("displays the correct statistics from the API", async () => {
    getBicycles.mockResolvedValue([
      { _id: "bike-1", name: "Speedster" },
      { _id: "bike-2", name: "Mountain King" },
    ]);

    getPartOptions.mockResolvedValue([
      { _id: "frame-carbon", category: "Frame", value: "Carbon" },
      { _id: "brakes-disc", category: "Brakes", value: "Disc" },
      { _id: "frame-aluminum", category: "Frame", value: "Aluminum" },
    ]);

    render(
      <MemoryRouter>
        <AdminOverview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    expect(screen.getByText("Total Bicycles")).toBeInTheDocument();
    expect(screen.getByText("Total Part Options")).toBeInTheDocument();
  });

  it("navigates to the Bicycles page when clicking 'Manage Bicycles'", async () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/bicycles" element={<h1>Bicycles Page</h1>} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText("Total Bicycles");

    const bicyclesLink = screen.getByRole("link", { name: /manage bicycles/i });
    expect(bicyclesLink).toBeInTheDocument();
    fireEvent.click(bicyclesLink);

    expect(await screen.findByText("Bicycles Page")).toBeInTheDocument();
  });

  it("navigates to the Part Options page when clicking 'Manage Part Options'", async () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin" element={<AdminOverview />} />
          <Route
            path="/admin/part-options"
            element={<h1>Part Options Page</h1>}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText("Total Bicycles");

    const partOptionsLink = screen.getByRole("link", {
      name: /manage part options/i,
    });
    expect(partOptionsLink).toBeInTheDocument();
    fireEvent.click(partOptionsLink);

    expect(await screen.findByText("Part Options Page")).toBeInTheDocument();
  });
});
