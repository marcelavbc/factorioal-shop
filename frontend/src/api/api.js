import axios from "axios";
const API_BASE_URL = "http://localhost:5001/api";

// Fetch bicycle details
export const getBicycleById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/bicycles/${id}`);
  return response.data;
};

// Fetch the cart
export const getCart = async (cartId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cart`, {
      params: { cartId },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching cart:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Add to cart
export const addToCart = async (payload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/cart`, payload);
    return response.data;
  } catch (error) {
    console.error(
      "Error adding to cart:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Remove an item from the cart
export const removeFromCart = async (cartId, itemId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/cart/${itemId}`, {
      data: { cartId },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error removing item from cart:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Update the quantity of an item in the cart
export const updateCartItem = async (cartId, itemId, data) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/cart/${itemId}?cartId=${cartId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating cart item:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Fetch all part options
export const getPartOptions = async () => {
  const response = await axios.get(`${API_BASE_URL}/part-options`);
  return response.data;
};

// Delete a part option by ID
export const deletePartOption = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/part-options/${id}`);
  return response.data;
};

// Fetch all bicycles
export const getBicycles = async () => {
  const response = await axios.get(`${API_BASE_URL}/bicycles`);
  return response.data;
};

// Delete a bicycle by ID
export const deleteBicycle = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/bicycles/${id}`);
  return response.data;
};

// Create a new bicycle
export const createBicycle = async (bicycleData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bicycles`, bicycleData);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating bicycle:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

// Update an existing bicycle
export const updateBicycle = async (id, bicycleData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/bicycles/${id}`,
      bicycleData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating bicycle:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

// Create a new part option
export const createPartOption = async (partOptionData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/part-options`,
      partOptionData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating part option:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

// Update Part Option (category, value, stock)
export const updatePartOption = async (optionId, updatedData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/part-options/${optionId}`,
      updatedData
    );
    return response.data;
  } catch (err) {
    console.error("Failed to update part option:", err);
    throw err;
  }
};

// Update restrictions
export const updateRestrictions = async (id, restrictions) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/part-options/${id}/restrictions`,
      { restrictions }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating restrictions:",
      error.response?.data || error.message
    );
    throw error;
  }
};
