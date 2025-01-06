import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import { useCart } from "../../context/CartContext";
import { getCart } from "../../api/api";

jest.mock("../../context/CartContext");

describe("Layout Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCart.mockReturnValue({ cartItems: 0, setCartItems: jest.fn() });
    localStorage.getItem.mockReturnValue(null);
    getCart.mockResolvedValue({ items: [] });
  });

  it("renders logo and cart icon", () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    expect(
      screen.getByRole("link", { name: /Factorial Wheels/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /🛒/i })).toBeInTheDocument();
  });

  it("disables cart icon when cart is empty", () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    const cartIcon = screen.getByRole("link", { name: /🛒/i });
    expect(cartIcon).toHaveClass("disabled");
  });

  it("updates cart count when items exist", async () => {
    const mockSetCartItems = jest.fn();
    useCart.mockReturnValue({ cartItems: 0, setCartItems: mockSetCartItems });

    localStorage.getItem.mockReturnValue("test-cart-id");
    getCart.mockResolvedValue({ items: [{ quantity: 2 }, { quantity: 3 }] });

    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    await waitFor(() => expect(getCart).toHaveBeenCalledWith("test-cart-id"));
    expect(mockSetCartItems).toHaveBeenCalledWith(5);
  });

  it("does not call getCart if cartId is missing", async () => {
    const mockSetCartItems = jest.fn();
    useCart.mockReturnValue({ cartItems: 0, setCartItems: mockSetCartItems });

    localStorage.getItem.mockReturnValue(null);

    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    await waitFor(() => expect(getCart).not.toHaveBeenCalled());
    expect(mockSetCartItems).not.toHaveBeenCalled();
  });
});
