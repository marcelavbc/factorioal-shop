import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./layout.scss";

const Layout = () => {
  const { cartItems } = useCart();

  return (
    <div className="layout-container">
      <header className="header">
        <Link to="/" className="logo">
          Factorial Wheels
        </Link>
        <div className="nav-icons">
          <Link
            to="/cart"
            className={`cart-icon ${cartItems === 0 ? "disabled" : ""}`}
          >
            🛒{" "}
            {cartItems > 0 && <span className="cart-count">{cartItems}</span>}
          </Link>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} Factorial Wheels - All Rights Reserved
        </p>
      </footer>
    </div>
  );
};

export default Layout;
