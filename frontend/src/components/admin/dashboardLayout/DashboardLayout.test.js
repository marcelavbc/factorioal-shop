import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter, useLocation } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn(),
  Outlet: () => <div data-testid="outlet-component">Mock Outlet</div>,
}));

describe("DashboardLayout Component", () => {
  beforeEach(() => {
    useLocation.mockReturnValue({ pathname: "/admin" });
  });

  it("renders Admin Dashboard heading", () => {
    render(
      <BrowserRouter>
        <DashboardLayout />
      </BrowserRouter>
    );

    expect(
      screen.getByRole("heading", { name: /Admin Dashboard/i })
    ).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    render(
      <BrowserRouter>
        <DashboardLayout />
      </BrowserRouter>
    );

    expect(screen.getByRole("link", { name: /Overview/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Manage Bicycles/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Manage Part Options/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Manage Restrictions/i })
    ).toBeInTheDocument();
  });

  it("applies active class to the correct navigation link", () => {
    useLocation.mockReturnValue({ pathname: "/admin/part-options" });

    render(
      <BrowserRouter>
        <DashboardLayout />
      </BrowserRouter>
    );

    const activeLink = screen.getByRole("link", {
      name: /Manage Part Options/i,
    });
    expect(activeLink).toHaveClass("active");

    const inactiveLink = screen.getByRole("link", { name: /Overview/i });
    expect(inactiveLink).not.toHaveClass("active");
  });

  it("renders child components via Outlet", () => {
    render(
      <BrowserRouter>
        <DashboardLayout />
      </BrowserRouter>
    );

    expect(screen.getByTestId("outlet-component")).toBeInTheDocument();
  });
});
