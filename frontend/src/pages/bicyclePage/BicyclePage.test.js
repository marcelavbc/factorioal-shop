import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BicyclePage from "./BicyclePage";
import { getBicycleById, addToCart } from "../../api/api";
import { ToastContainer } from "react-toastify";
import { useCart } from "../../context/CartContext";

jest.mock("../../api/api");
jest.mock("../../context/CartContext", () => ({
  useCart: jest.fn(() => ({
    cartItems: 0,
    setCartItems: jest.fn(),
  })),
}));

const mockBicycle = {
  _id: "677a50d40d567747ae89f131",
  name: "Fat Tire Pro",
  description: "Conquer the toughest terrains with style.",
  price: 1500,
  image:
    "https://images.unsplash.com/photo-1528629297340-d1d466945dc5?q=80&w=2122&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  partOptions: [
    {
      _id: "677a50d40d567747ae89f121",
      category: "Frame Type",
      value: "Full Suspension",
      stock: "in_stock",
      restrictions: {},
      __v: 0,
    },
    {
      _id: "677a50d40d567747ae89f122",
      category: "Frame Type",
      value: "Diamond",
      stock: "in_stock",
      restrictions: {},
      __v: 0,
    },
    {
      _id: "677a50d40d567747ae89f124",
      category: "Frame Finish",
      value: "Matte",
      stock: "in_stock",
      restrictions: {},
      __v: 0,
    },
    {
      _id: "677a50d40d567747ae89f128",
      category: "Wheels",
      value: "Fat Bike Wheels",
      stock: "in_stock",
      restrictions: {},
      __v: 0,
    },
    {
      _id: "677a50d40d567747ae89f126",
      category: "Wheels",
      value: "Road Wheels",
      stock: "in_stock",
      restrictions: {},
      __v: 0,
    },
    {
      _id: "677a50d40d567747ae89f12a",
      category: "Rim Color",
      value: "Black",
      stock: "in_stock",
      restrictions: {},
      __v: 0,
    },
    {
      _id: "677a50d40d567747ae89f129",
      category: "Rim Color",
      value: "Red",
      stock: "in_stock",
      restrictions: {},
      __v: 0,
    },
    {
      _id: "677a50d40d567747ae89f12b",
      category: "Rim Color",
      value: "Blue",
      stock: "in_stock",
      restrictions: {},
      __v: 0,
    },
    {
      _id: "677a50d40d567747ae89f12d",
      category: "Chain",
      value: "8-Speed Chain",
      stock: "in_stock",
      restrictions: {},
      __v: 0,
    },
  ],
  __v: 0,
  options: [
    {
      category: "Frame Type",
      values: [
        {
          value: "Full Suspension",
          stock: "in_stock",
          restrictions: {
            "Frame Finish": ["Shiny"],
          },
        },
        {
          value: "Diamond",
          stock: "in_stock",
          restrictions: {},
        },
      ],
    },
    {
      category: "Frame Finish",
      values: [
        {
          value: "Matte",
          stock: "in_stock",
          restrictions: {},
        },
      ],
    },
    {
      category: "Wheels",
      values: [
        {
          value: "Fat Bike Wheels",
          stock: "in_stock",
          restrictions: {
            "Rim Color": ["Red"],
          },
        },
        {
          value: "Road Wheels",
          stock: "in_stock",
          restrictions: {},
        },
      ],
    },
    {
      category: "Rim Color",
      values: [
        {
          value: "Black",
          stock: "in_stock",
          restrictions: {},
        },
        {
          value: "Red",
          stock: "in_stock",
          restrictions: {},
        },
        {
          value: "Blue",
          stock: "in_stock",
          restrictions: {},
        },
      ],
    },
    {
      category: "Chain",
      values: [
        {
          value: "8-Speed Chain",
          stock: "in_stock",
          restrictions: {},
        },
      ],
    },
  ],
};

describe("BicyclePage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getBicycleById.mockResolvedValue(mockBicycle); // ✅ Ensure mock is set before rendering
  });

  it("renders loading spinner initially", async () => {
    getBicycleById.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <BicyclePage />
      </MemoryRouter>
    );

    expect(screen.getByRole("status")).toBeInTheDocument(); // Check if spinner is present
  });

  it("renders bicycle details correctly", async () => {
    render(
      <MemoryRouter>
        <BicyclePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Fat Tire Pro")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.getByText("Conquer the toughest terrains with style.")
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("$1500")).toBeInTheDocument();
    });
  });

  it("renders customization options correctly", async () => {
    render(
      <MemoryRouter>
        <BicyclePage />
      </MemoryRouter>
    );

    await screen.findByText("Fat Tire Pro");

    expect(screen.getByText(/Frame Finish/i)).toBeInTheDocument();
    expect(screen.getByText(/Frame Type/i)).toBeInTheDocument();
  });

  it("ensures all required selections are made", async () => {
    render(
      <MemoryRouter>
        <BicyclePage />
      </MemoryRouter>
    );

    await screen.findByText("Fat Tire Pro");

    const addToCartButton = screen.getByRole("button", {
      name: /add to cart/i,
    });
    expect(addToCartButton).toBeDisabled();

    const frameFinishSelect = screen.getByLabelText(/frame finish/i);
    const frameTypeSelect = screen.getByLabelText(/frame type/i);
    const rimColorSelect = screen.getByLabelText(/rim color/i);
    const chainSelect = screen.getByLabelText(/chain/i);

    fireEvent.change(frameFinishSelect, { target: { value: "Matte" } });
    fireEvent.change(frameTypeSelect, { target: { value: "Full Suspension" } });
    fireEvent.change(rimColorSelect, { target: { value: "Red" } });
    fireEvent.change(chainSelect, { target: { value: "8-Speed Chain" } });

    fireEvent.change(chainSelect, { target: { value: "" } });
    expect(addToCartButton).toBeDisabled();

    fireEvent.change(chainSelect, { target: { value: "8-Speed Chain" } });
    expect(addToCartButton).toBeDisabled();
  });
  it("removes restricted rim color based on selected wheels", async () => {
    render(
      <MemoryRouter>
        <BicyclePage />
        <ToastContainer />
      </MemoryRouter>
    );

    await screen.findByText("Fat Tire Pro");

    // ✅ Select "Fat Bike Wheels"
    const wheelsDropdown = await screen.findByLabelText(/Wheels:/i);
    fireEvent.mouseDown(wheelsDropdown);
    fireEvent.click(screen.getByText("Fat Bike Wheels"));

    // ✅ Open Rim Color dropdown
    const rimColorDropdown = await screen.findByLabelText(/Rim Color:/i);
    fireEvent.mouseDown(rimColorDropdown);

    // ✅ Ensure "Red" is NOT present
    await waitFor(() => {
      expect(screen.queryByText("Red")).not.toBeInTheDocument();
    });
  });
  it("resets wheels selection when restricted rim color is chosen", async () => {
    render(
      <MemoryRouter>
        <BicyclePage />
        <ToastContainer />
      </MemoryRouter>
    );

    await screen.findByText("Fat Tire Pro");

    // ✅ Select "Red" Rim Color first
    const rimColorDropdown = await screen.findByLabelText(/Rim Color:/i);
    fireEvent.mouseDown(rimColorDropdown);
    fireEvent.click(screen.getByText("Red"));

    // ✅ Select "Fat Bike Wheels"
    const wheelsDropdown = await screen.findByLabelText(/Wheels:/i);
    fireEvent.mouseDown(wheelsDropdown);
    fireEvent.click(screen.getByText("Fat Bike Wheels"));

    // ✅ Ensure wheels selection is reset
    await waitFor(() => {
      // Check if no option is selected
      expect(
        screen.queryByText("Fat Bike Wheels", {
          selector: ".css-1uccc91-singleValue",
        })
      ).not.toBeInTheDocument();
    });

    // ✅ Ensure error message appears
    await waitFor(() => {
      expect(
        screen.getByText(
          /restriction: "Fat Bike Wheels" does not allow "Rim Color" to be "Red"./i
        )
      ).toBeInTheDocument();
    });
  });
  it("resets rim color selection when a restricted wheels option is chosen", async () => {
    render(
      <MemoryRouter>
        <BicyclePage />
        <ToastContainer />
      </MemoryRouter>
    );

    await screen.findByText("Fat Tire Pro");

    // ✅ Select "Red" Rim Color first
    const rimColorDropdown = await screen.findByLabelText(/Rim Color:/i);
    fireEvent.mouseDown(rimColorDropdown);
    fireEvent.click(screen.getByText("Red"));

    // ✅ Select "Fat Bike Wheels" (which should reset Rim Color)
    const wheelsDropdown = await screen.findByLabelText(/Wheels:/i);
    fireEvent.mouseDown(wheelsDropdown);
    fireEvent.click(screen.getByText("Fat Bike Wheels"));

    // ✅ Ensure Rim Color selection is reset
    await waitFor(() => {
      expect(
        screen.queryByText("Red", { selector: ".css-1uccc91-singleValue" })
      ).not.toBeInTheDocument();
    });

    // ✅ Ensure error message appears
    await waitFor(() => {
      expect(
        screen.getByText(
          /restriction: "Fat Bike Wheels" does not allow "Rim Color" to be "Red"./i
        )
      ).toBeInTheDocument();
    });
  });
  it("removes restricted rim color options when selecting restricted wheels", async () => {
    render(
      <MemoryRouter>
        <BicyclePage />
        <ToastContainer />
      </MemoryRouter>
    );

    await screen.findByText("Fat Tire Pro");

    // ✅ Select "Fat Bike Wheels"
    const wheelsDropdown = await screen.findByLabelText(/Wheels:/i);
    fireEvent.mouseDown(wheelsDropdown);
    fireEvent.click(screen.getByText("Fat Bike Wheels"));

    // ✅ Open Rim Color dropdown
    const rimColorDropdown = await screen.findByLabelText(/Rim Color:/i);
    fireEvent.mouseDown(rimColorDropdown);

    // ✅ Ensure "Red" is NOT present in the dropdown list
    await waitFor(() => {
      expect(screen.queryByText("Red")).not.toBeInTheDocument();
    });

    // ✅ Ensure other colors (e.g., "Black" and "Blue") are still available
    expect(screen.getByText("Black")).toBeInTheDocument();
    expect(screen.getByText("Blue")).toBeInTheDocument();
  });

  it("shows a toast if user chooses some restrict value", async () => {
    render(
      <MemoryRouter>
        <BicyclePage />
        <ToastContainer />
      </MemoryRouter>
    );

    await screen.findByText("Fat Tire Pro");

    // ✅ Select "Red" Rim Color
    const rimColorDropdown = await screen.findByLabelText(/Rim Color:/i);
    fireEvent.mouseDown(rimColorDropdown);
    fireEvent.click(screen.getByText("Red"));

    // ✅ Select "Fat Bike Wheels"
    const wheelsDropdown = await screen.findByLabelText(/Wheels:/i);
    fireEvent.mouseDown(wheelsDropdown);
    fireEvent.click(screen.getByText("Fat Bike Wheels"));

    // ✅ Ensure toast message appears
    await waitFor(() => {
      expect(
        screen.getByText(
          /restriction: "Fat Bike Wheels" does not allow "Rim Color" to be "Red"/i
        )
      ).toBeInTheDocument();
    });
  });

  it("creates a new cart and adds bicycle when no cart exists", async () => {
    // ✅ Mock addToCart with updated response structure
    addToCart.mockResolvedValue({
      cartId: "677b23f1ebfaaa703ac8aa31",
      items: [
        {
          bicycle: {
            _id: "677a50d40d567747ae89f131",
            name: "Fat Tire Pro",
            price: 1500,
            image:
              "https://images.unsplash.com/photo-1528629297340-d1d466945dc5?q=80&w=2122&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
          options: [
            { category: "Wheels", value: "Fat Bike Wheels", _id: "opt-1" },
            { category: "Rim Color", value: "Black", _id: "opt-2" },
            { category: "Frame Type", value: "Full Suspension", _id: "opt-3" },
            { category: "Frame Finish", value: "Matte", _id: "opt-4" },
            { category: "Chain", value: "8-Speed Chain", _id: "opt-5" },
          ],
          quantity: 1,
          _id: "cart-item-1",
        },
      ],
    });

    render(
      <MemoryRouter>
        <BicyclePage />
        <ToastContainer />
      </MemoryRouter>
    );

    // ✅ Wait for the bike details to load
    await screen.findByText("Fat Tire Pro");

    // ✅ Select customization options
    fireEvent.mouseDown(screen.getByLabelText(/Frame Finish/i));
    fireEvent.click(screen.getByText("Matte"));

    fireEvent.mouseDown(screen.getByLabelText(/Frame Type/i));
    fireEvent.click(screen.getByText("Full Suspension"));

    fireEvent.mouseDown(screen.getByLabelText(/Rim Color/i));
    fireEvent.click(screen.getByText("Black"));

    fireEvent.mouseDown(screen.getByLabelText(/Chain/i));
    fireEvent.click(screen.getByText("8-Speed Chain"));

    fireEvent.mouseDown(screen.getByLabelText(/Wheels/i));
    fireEvent.click(screen.getByText("Fat Bike Wheels"));

    const addToCartButton = screen.getByRole("button", {
      name: /add to cart/i,
    });

    // ✅ Ensure button is enabled before clicking
    await waitFor(() => expect(addToCartButton).not.toBeDisabled());

    fireEvent.click(addToCartButton);

    // ✅ Ensure `addToCart` is called correctly
    await waitFor(() => {
      expect(addToCart).toHaveBeenCalled();
    });

    // ✅ Ensure success toast appears
    await waitFor(() => {
      expect(screen.getByText("Bicycle added to cart!")).toBeInTheDocument();
    });
  });
});
