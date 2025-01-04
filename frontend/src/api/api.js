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
      params: { cartId }, // Pass cartId as a query parameter
    });
    return response.data; // Return cart data
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
    return response.data; // Return the updated cart or cartId
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
  console.log("API URL:", `${API_BASE_URL}/cart/${itemId}`);
  console.log("Payload (cartId):", { cartId });

  try {
    const response = await axios.delete(`${API_BASE_URL}/cart/${itemId}`, {
      data: { cartId }, // Ensure `cartId` is being passed in the body
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
    return response.data; // Return updated cart
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

// Add a new part option with allowed parts
export const addPartOption = async (partOptionData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/part-options`,
      partOptionData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error adding part option:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Update Part Option (e.g., change stock status)
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

// Update allowed parts for a part option
export const updateAllowedParts = async (id, allowedParts) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/part-options/${id}/allowed-parts`,
      { allowedParts }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating allowed parts:",
      error.response?.data || error.message
    );
    throw error;
  }
};
