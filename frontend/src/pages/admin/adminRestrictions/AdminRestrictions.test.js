import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminRestrictions from "./AdminRestrictions";
import { getPartOptions } from "../../../api/api";
jest.mock("../../../components/admin/modal/AdminModal", () => (props) => {
  return (
    <div data-testid="mocked-modal">
      <h2>Mocked Modal</h2>
      {props.children}
    </div>
  );
});

describe("AdminRestrictions Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getPartOptions.mockResolvedValue([
      {
        _id: "part-1",
        category: "Frame",
        value: "Carbon",
        stock: "in_stock",
        restrictions: {},
      },
      {
        _id: "part-2",
        category: "Brakes",
        value: "Disc",
        stock: "in_stock",
        restrictions: {},
      },
    ]);
  });

  it("renders loading spinner initially", async () => {
    getPartOptions.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <AdminRestrictions />
      </MemoryRouter>
    );

    expect(screen.getByRole("status")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });
  it("renders part options correctly when API call succeeds", async () => {
    render(
      <MemoryRouter>
        <AdminRestrictions />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Manage Part Restrictions")).toBeInTheDocument();
    });

    expect(screen.getByText("Frame")).toBeInTheDocument();
    expect(screen.getByText("Brakes")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /carbon/i })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /disc/i })).toBeInTheDocument();
  });

  it("shows an error message if API call fails", async () => {
    getPartOptions.mockRejectedValue(new Error("Failed to fetch part options"));

    render(
      <MemoryRouter>
        <AdminRestrictions />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load part options.")
      ).toBeInTheDocument();
    });
  });
  it("selects a part option and displays its restrictions", async () => {
    getPartOptions.mockResolvedValue([
      {
        _id: "frame-1",
        category: "Frame",
        value: "Carbon",
        stock: "in_stock",
        restrictions: { Brakes: ["Disc"] },
      },
    ]);

    render(
      <MemoryRouter>
        <AdminRestrictions />
      </MemoryRouter>
    );

    await screen.findByText("Manage Part Restrictions");

    fireEvent.click(screen.getByRole("button", { name: /carbon/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Manage Restrictions for Carbon")
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Brakes/i)).toBeInTheDocument();
    expect(screen.getByText(/Disc/i)).toBeInTheDocument();
  });

  it("removes a restriction when 'Remove' button is clicked", async () => {
    getPartOptions.mockResolvedValue([
      {
        _id: "frame-1",
        category: "Frame",
        value: "Carbon",
        stock: "in_stock",
        restrictions: { Brakes: ["Disc"] },
      },
    ]);

    render(
      <MemoryRouter>
        <AdminRestrictions />
      </MemoryRouter>
    );

    await screen.findByText("Manage Part Restrictions");

    fireEvent.click(screen.getByRole("button", { name: /carbon/i }));

    expect(screen.getByText(/Brakes/i)).toBeInTheDocument();
    expect(screen.getByText(/Disc/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /remove/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Brakes/i)).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText(/Disc/i)).not.toBeInTheDocument();
    });
  });

  it("opens the modal when 'Add Restriction' button is clicked", async () => {
    render(
      <MemoryRouter>
        <AdminRestrictions />
      </MemoryRouter>
    );

    await screen.findByText("Manage Part Restrictions");

    fireEvent.click(screen.getByRole("button", { name: /carbon/i }));

    const addRestrictionButton = await screen.findByTestId(
      "add-restriction-Carbon"
    );

    fireEvent.click(addRestrictionButton);

    await waitFor(async () => {
      await screen.findByTestId("mocked-modal");
      expect(screen.getByText("Mocked Modal")).toBeInTheDocument();
    });
  });
});
