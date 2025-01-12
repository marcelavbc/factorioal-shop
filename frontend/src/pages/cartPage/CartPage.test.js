import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CartProvider } from "../../context/CartContext";
import CartPage from "./CartPage";
import { getCart, removeFromCart, updateCartItem } from "../../api/api";
import { toast } from "react-toastify";

jest.mock("../../api/api", () => ({
  getCart: jest.fn(),
  removeFromCart: jest.fn(),
  updateCartItem: jest.fn(),
}));
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));
describe("CartPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => "12345"),
        setItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    getCart.mockResolvedValue({
      cartId: "12345",
      items: [
        {
          _id: "item1",
          quantity: 2,
          bicycle: { name: "Mountain Bike", price: 500, image: "bike.jpg" },
          options: [{ category: "Color", value: "Red" }],
        },
      ],
    });
  });

  it("renders CartPage and verifies the heading", async () => {
    render(
      <CartProvider>
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      </CartProvider>
    );

    await waitFor(() => {
      expect(getCart).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText("Your Cart")).toBeInTheDocument();
    });
  });
  it("shows loading spinner initially", async () => {
    getCart.mockImplementation(() => new Promise(() => {}));

    render(
      <CartProvider>
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      </CartProvider>
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
  it("displays an error message when cart API fails", async () => {
    getCart.mockRejectedValue(new Error("Network error"));

    render(
      <CartProvider>
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to load cart data.")).toBeInTheDocument();
    });
  });
  it("displays empty cart message when no items are present", async () => {
    getCart.mockResolvedValue({
      cartId: "12345",
      items: [],
    });

    render(
      <CartProvider>
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
    });
  });
  it("allows updating item quantity", async () => {
    getCart.mockResolvedValue({
      cartId: "12345",
      items: [
        {
          _id: "item1",
          quantity: 2,
          bicycle: { name: "Mountain Bike", price: 500, image: "bike.jpg" },
          options: [{ category: "Color", value: "Red" }],
        },
      ],
    });

    updateCartItem.mockResolvedValue({
      cartId: "12345",
      items: [
        {
          _id: "item1",
          quantity: 3,
          bicycle: { name: "Mountain Bike", price: 500, image: "bike.jpg" },
          options: [{ category: "Color", value: "Red" }],
        },
      ],
    });

    render(
      <CartProvider>
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Your Cart")).toBeInTheDocument();
    });

    const quantityInput = screen.getByLabelText("Quantity:");
    fireEvent.change(quantityInput, { target: { value: "3" } });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(updateCartItem).toHaveBeenCalledWith("12345", "item1", {
        quantity: 3,
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Quantity updated!");
    });
  });
  it("prevents updating quantity to invalid values", async () => {
    getCart.mockResolvedValue({
      cartId: "12345",
      items: [
        {
          _id: "item1",
          quantity: 2,
          bicycle: { name: "Mountain Bike", price: 500, image: "bike.jpg" },
          options: [{ category: "Color", value: "Red" }],
        },
      ],
    });

    render(
      <CartProvider>
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Your Cart")).toBeInTheDocument();
    });

    const quantityInput = screen.getByLabelText("Quantity:");
    fireEvent.change(quantityInput, { target: { value: "0" } });

    const saveButton = screen.getByText("Save");

    expect(quantityInput).not.toHaveValue("0");

    expect(saveButton).toBeDisabled();

    expect(updateCartItem).not.toHaveBeenCalled();
  });
  it("allows removing an item from the cart", async () => {
    getCart.mockResolvedValue({
      cartId: "12345",
      items: [
        {
          _id: "item1",
          quantity: 2,
          bicycle: { name: "Mountain Bike", price: 500, image: "bike.jpg" },
          options: [{ category: "Color", value: "Red" }],
        },
      ],
    });

    removeFromCart.mockResolvedValue({
      cartId: "12345",
      items: [],
    });

    render(
      <CartProvider>
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Your Cart")).toBeInTheDocument();
    });

    const removeButton = screen.getByText("Remove");
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(removeFromCart).toHaveBeenCalledWith("12345", "item1");
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Item removed from cart!");
    });

    await waitFor(() => {
      expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
    });
  });
  it("handles API failure when removing an item", async () => {
    getCart.mockResolvedValue({
      cartId: "12345",
      items: [
        {
          _id: "item1",
          quantity: 2,
          bicycle: { name: "Mountain Bike", price: 500, image: "bike.jpg" },
          options: [{ category: "Color", value: "Red" }],
        },
      ],
    });

    removeFromCart.mockRejectedValue(new Error("API Error"));

    render(
      <CartProvider>
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Your Cart")).toBeInTheDocument();
    });

    const removeButton = screen.getByText("Remove");
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(removeFromCart).toHaveBeenCalledWith("12345", "item1");
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to remove item from cart."
      );
    });

    expect(screen.getByText("Mountain Bike")).toBeInTheDocument();
  });
  it("allows proceeding to checkout", async () => {
    getCart.mockResolvedValue({
      cartId: "12345",
      items: [
        {
          _id: "item1",
          quantity: 2,
          bicycle: { name: "Mountain Bike", price: 500, image: "bike.jpg" },
          options: [{ category: "Color", value: "Red" }],
        },
      ],
    });

    render(
      <CartProvider>
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Your Cart")).toBeInTheDocument();
    });

    const checkoutButton = screen.getByText("Proceed to Checkout");
    fireEvent.click(checkoutButton);

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith("Checkout coming soon!");
    });
  });
});
