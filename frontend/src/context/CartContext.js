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

        if (!cartId) {
          return;
        }

        const cart = await getCart(cartId);

        const totalQuantity = cart.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        setCartItems(totalQuantity);
      } catch (err) {}
    };

    fetchCart();
  }, []);

  const value = useMemo(() => ({ cartItems, setCartItems }), [cartItems]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
