import axios from "axios";
const API_BASE_URL = "http://localhost:5001/api";

// Fetch bicycle details
export const getBicycleById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/bicycles/${id}`);
  return response.data;
};

// Add to cart
export const addToCart = async (cartData) => {
  const response = await axios.post(`${API_BASE_URL}/cart`, cartData);
  return response.data;
};

// Fetch the cart
export const getCart = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cart`);
    return response.data; // Return the cart data
  } catch (error) {
    console.error(
      "Error fetching cart:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Remove an item from the cart
export const removeFromCart = async (itemId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/cart/${itemId}`);
    return response.data; // Return the updated cart or success message
  } catch (error) {
    console.error(
      "Error removing item from cart:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Update the quantity of an item in the cart
export const updateCartItem = async (itemId, data) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/cart/${itemId}`, data);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating cart item:",
      error.response?.data || error.message
    );
    throw error;
  }
};
