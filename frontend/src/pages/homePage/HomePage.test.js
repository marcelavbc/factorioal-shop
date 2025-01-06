import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage";
import { getBicycles } from "../../api/api";

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

describe("HomePage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getBicycles.mockResolvedValue(mockBicycles);
  });

  it("renders loading spinner initially", async () => {
    getBicycles.mockImplementation(() => new Promise(() => {})); // Simulate loading state

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByRole("status")).toBeInTheDocument(); // Check if spinner is present
  });
  it("renders bicycles correctly after API call", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // ✅ Ensure API was called before testing UI
    await waitFor(() => {
      expect(getBicycles).toHaveBeenCalledTimes(1);
    });

    // ✅ Check if bicycles are rendered correctly
    expect(await screen.findByText("Mountain Explorer")).toBeInTheDocument();
    expect(await screen.findByText("City Cruiser")).toBeInTheDocument();

    // ✅ Check if at least one "View Details" link is present
    expect(screen.getAllByText("🔍 View Details").length).toBeGreaterThan(0);
  });
  it("displays an error message when API call fails", async () => {
    getBicycles.mockRejectedValue(new Error("Failed to fetch bicycles"));

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
    getBicycles.mockResolvedValue([]); // Mock empty response

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
