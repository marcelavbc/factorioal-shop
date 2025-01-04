import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { getCart } from "../api/api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartId = localStorage.getItem("cartId");
        if (!cartId) return;

        const cart = await getCart(cartId);
        setCartItems(cart.items.length);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }

      CartProvider.propTypes = {
        children: PropTypes.node.isRequired,
      };
    };

    fetchCart();
  }, []);

  const value = useMemo(
    () => ({ cartItems, setCartItems }),
    [cartItems, setCartItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
