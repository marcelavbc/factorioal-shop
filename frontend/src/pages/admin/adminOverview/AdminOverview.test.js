import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminOverview from "./AdminOverview";
import * as api from "../../../api/api";
import axios from "axios";

jest.mock("axios");
describe("AdminOverview Component", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("renders loading spinner initially", async () => {
    jest.spyOn(api, "getBicycles");
    jest.spyOn(api, "getPartOptions");

    axios.get.mockResolvedValueOnce({ data: [] });

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
    jest.spyOn(api, "getBicycles");
    jest.spyOn(api, "getPartOptions");

    axios.get
      .mockResolvedValueOnce({
        data: [
          { _id: "bike-1", name: "Speedster" },
          { _id: "bike-2", name: "Mountain King" },
        ],
      })
      .mockResolvedValueOnce({
        data: [
          { _id: "option-1", category: "Frame", value: "Carbon" },
          { _id: "option-2", category: "Brakes", value: "Disc" },
          { _id: "option-3", category: "Frame", value: "Aluminum" },
        ],
      });

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
    jest.spyOn(api, "getBicycles");
    jest.spyOn(api, "getPartOptions");

    axios.get
      .mockRejectedValueOnce(new Error("Failed to fetch bicycles"))
      .mockRejectedValueOnce(new Error("Failed to fetch part options"));

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
  it("navigates to the Bicycles page when clicking 'Manage Bicycles'", async () => {
    jest.spyOn(api, "getBicycles").mockResolvedValue([
      { _id: "bike-1", name: "Speedster" },
      { _id: "bike-2", name: "Mountain King" },
    ]);
    jest.spyOn(api, "getPartOptions").mockResolvedValue([
      { _id: "option-1", category: "Frame", value: "Carbon" },
      { _id: "option-2", category: "Brakes", value: "Disc" },
      { _id: "option-3", category: "Frame", value: "Aluminum" },
    ]);

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
    jest.spyOn(api, "getBicycles").mockResolvedValue([
      { _id: "bike-1", name: "Speedster" },
      { _id: "bike-2", name: "Mountain King" },
    ]);
    jest.spyOn(api, "getPartOptions").mockResolvedValue([
      { _id: "option-1", category: "Frame", value: "Carbon" },
      { _id: "option-2", category: "Brakes", value: "Disc" },
      { _id: "option-3", category: "Frame", value: "Aluminum" },
    ]);

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
