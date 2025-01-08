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
import * as api from "../../../api/api";

jest.mock("../../../components/admin/modal/AdminModal", () => (props) => {
  return (
    <div data-testid="mocked-modal">
      <h2>Mocked Modal</h2>
      {props.children}
    </div>
  );
});

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
    jest.restoreAllMocks();
    jest.clearAllMocks();

    jest
      .spyOn(api, "getPartOptions")
      .mockResolvedValue([...mockPartOptions.Frame, ...mockPartOptions.Brakes]);
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

  it("toggles stock status of a part option", async () => {
    jest.spyOn(api, "updatePartOption").mockResolvedValue({
      _id: "frame-carbon",
      category: "Frame",
      value: "Carbon",
      stock: "out_of_stock",
    });

    render(
      <MemoryRouter>
        <AdminParts />
      </MemoryRouter>
    );

    await screen.findByText("Manage Part Options");

    const toggleButton = screen.getAllByText("Mark as Out of Stock")[0];

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(api.updatePartOption).toHaveBeenCalledWith("frame-carbon", {
        stock: "out_of_stock",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Carbon (out_of_stock)")).toBeInTheDocument();
    });
  });

  it("shows an error message if API call fails", async () => {
    jest
      .spyOn(api, "getPartOptions")
      .mockRejectedValue(new Error("Failed to fetch part options"));

    render(<AdminParts />);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load part options.")
      ).toBeInTheDocument();
    });
  });

  it("shows 'No part options available' when API returns an empty list", async () => {
    jest.spyOn(api, "getPartOptions").mockResolvedValue([]);

    render(<AdminParts />);

    await waitFor(() => {
      expect(
        screen.getByText("No part options available.")
      ).toBeInTheDocument();
    });
  });
  it("deletes a part option", async () => {
    jest.spyOn(api, "deletePartOption").mockResolvedValue();

    render(<AdminParts />);

    await screen.findByText("Manage Part Options");

    const deleteButton = screen.getAllByText("Delete")[0];

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(api.deletePartOption).toHaveBeenCalledWith("frame-carbon");
    });

    await waitFor(() => {
      expect(screen.queryByText("Carbon (in_stock)")).not.toBeInTheDocument();
    });
  });
  it("handles network failure gracefully", async () => {
    jest
      .spyOn(api, "createPartOption")
      .mockRejectedValue(new Error("Network error"));

    render(
      <MemoryRouter>
        <AdminParts />
        <ToastContainer />
      </MemoryRouter>
    );

    await screen.findByText("Manage Part Options");

    fireEvent.click(screen.getByRole("button", { name: /\+ add frame/i }));

    const modal = await screen.findByTestId("mocked-modal");
    expect(modal).toBeInTheDocument();

    fireEvent.change(within(modal).getByLabelText(/value/i), {
      target: { value: "Steel" },
    });

    fireEvent.click(
      within(modal).getByRole("button", { name: /^add frame$/i })
    );

    await waitFor(() => {
      expect(api.createPartOption).toHaveBeenCalledWith({
        category: "Frame",
        value: "Steel",
        stock: "in_stock",
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText("Failed to add part option.")
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId("mocked-modal")).toBeInTheDocument();
  });
  it("prevents adding a duplicate part", async () => {
    jest.spyOn(api, "createPartOption");

    render(
      <MemoryRouter>
        <AdminParts />
        <ToastContainer />
      </MemoryRouter>
    );

    await screen.findByText("Manage Part Options");

    fireEvent.click(screen.getByRole("button", { name: /\+ add frame/i }));

    const modal = await screen.findByTestId("mocked-modal");
    expect(modal).toBeInTheDocument();

    fireEvent.change(within(modal).getByLabelText(/value/i), {
      target: { value: "Carbon" }, // Enter a duplicate value
    });

    fireEvent.click(
      within(modal).getByRole("button", { name: /^add frame$/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/"Carbon" already exists in Frame/i)
      ).toBeInTheDocument();
    });

    expect(api.createPartOption).not.toHaveBeenCalled();

    expect(screen.getByTestId("mocked-modal")).toBeInTheDocument();
  });
  it("shows success toast when a part is added", async () => {
    jest.spyOn(api, "createPartOption").mockResolvedValue({
      _id: "frame-steel",
      category: "Frame",
      value: "Steel",
      stock: "in_stock",
    });

    render(
      <MemoryRouter>
        <AdminParts />
        <ToastContainer />
      </MemoryRouter>
    );

    await screen.findByText("Manage Part Options");

    fireEvent.click(screen.getByRole("button", { name: /\+ add frame/i }));

    fireEvent.change(screen.getByLabelText(/value/i), {
      target: { value: "Steel" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^add frame$/i }));

    await waitFor(() => {
      expect(api.createPartOption).toHaveBeenCalledWith({
        category: "Frame",
        value: "Steel",
        stock: "in_stock",
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Added "Steel" to Frame!')).toBeInTheDocument();
    });
  });
  it("shows error toast when adding a part fails", async () => {
    jest
      .spyOn(api, "createPartOption")
      .mockRejectedValue(new Error("Network error"));

    render(
      <MemoryRouter>
        <AdminParts />
        <ToastContainer />
      </MemoryRouter>
    );

    await screen.findByText("Manage Part Options");

    fireEvent.click(screen.getByRole("button", { name: /\+ add frame/i }));

    fireEvent.change(screen.getByLabelText(/value/i), {
      target: { value: "Steel" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^add frame$/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Failed to add part option.")
      ).toBeInTheDocument();
    });
  });

  it("shows success toast when deleting a part", async () => {
    jest.spyOn(api, "deletePartOption").mockResolvedValue();

    render(
      <MemoryRouter>
        <AdminParts />
        <ToastContainer />
      </MemoryRouter>
    );

    await screen.findByText("Manage Part Options");

    const deleteButton = screen.getAllByText("Delete")[0];

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(api.deletePartOption).toHaveBeenCalledWith("frame-carbon");
    });

    await waitFor(() => {
      expect(
        screen.getByText("Part option deleted successfully!")
      ).toBeInTheDocument();
    });
  });

  it("shows error toast when deleting a part fails", async () => {
    jest
      .spyOn(api, "deletePartOption")
      .mockRejectedValue(new Error("Delete failed"));

    render(
      <MemoryRouter>
        <AdminParts />
        <ToastContainer />
      </MemoryRouter>
    );

    await screen.findByText("Manage Part Options");

    const deleteButton = screen.getAllByText("Delete")[0];

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(api.deletePartOption).toHaveBeenCalledWith("frame-carbon");
    });

    await waitFor(() => {
      expect(
        screen.getByText("Failed to delete part option.")
      ).toBeInTheDocument();
    });
  });

  it("shows error toast when stock update fails", async () => {
    jest
      .spyOn(api, "updatePartOption")
      .mockRejectedValue(new Error("Update failed"));

    render(
      <MemoryRouter>
        <AdminParts />
        <ToastContainer />
      </MemoryRouter>
    );

    await screen.findByText("Manage Part Options");

    const toggleButton = screen.getAllByText("Mark as Out of Stock")[0];

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(api.updatePartOption).toHaveBeenCalledWith("frame-carbon", {
        stock: "out_of_stock",
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText("Failed to update stock status.")
      ).toBeInTheDocument();
    });
  });
});
