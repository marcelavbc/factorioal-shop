import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage";
import * as api from "../../api/api";

describe("HomePage Component", () => {
  const mockBicycles = [
    {
      _id: "bike-1",
      name: "Mountain Explorer",
      description: "Perfect for off-road adventures.",
      price: 1200,
      image: "https://example.com/mountain-explorer.jpg",
    },
    {
      _id: "bike-2",
      name: "City Cruiser",
      description: "Smooth ride for urban exploration.",
      price: 800,
      image: "https://example.com/city-cruiser.jpg",
    },
  ];

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    jest.spyOn(api, "getBicycles").mockResolvedValue(mockBicycles);
  });

  it("renders loading spinner initially", async () => {
    jest
      .spyOn(api, "getBicycles")
      .mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders bicycles correctly after API call", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.getBicycles).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText("Mountain Explorer")).toBeInTheDocument();
    expect(await screen.findByText("City Cruiser")).toBeInTheDocument();

    expect(screen.getAllByText("🔍 View Details").length).toBeGreaterThan(0);
  });

  it("displays an error message when API call fails", async () => {
    jest
      .spyOn(api, "getBicycles")
      .mockRejectedValue(new Error("Failed to fetch bicycles"));

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/🚨 Failed to fetch bicycles/i)
      ).toBeInTheDocument();
    });
  });

  it("shows 'No bicycles available' if API returns an empty list", async () => {
    jest.spyOn(api, "getBicycles").mockResolvedValue([]);

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No bicycles available.")).toBeInTheDocument();
    });
  });
});
