const useCart = jest.fn(() => ({
  cartItems: 0,
  setCartItems: jest.fn(), // ✅ Ensure it's always defined
}));

export { useCart };
export default useCart;
