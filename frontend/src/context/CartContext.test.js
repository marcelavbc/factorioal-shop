import React from "react";
import { render, screen } from "@testing-library/react";
import { CartProvider } from "./CartContext";

beforeEach(() => {
  Storage.prototype.getItem = jest.fn(() => "12345");
});

it("renders `CartProvider` and verifies it mounts", () => {
  render(
    <CartProvider>
      <h2 data-testid="test-child">Test Child</h2>
    </CartProvider>
  );

  expect(screen.getByTestId("test-child")).toBeInTheDocument();
});
