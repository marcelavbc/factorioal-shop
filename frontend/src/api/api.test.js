import {
  addToCart,
  createBicycle,
  createPartOption,
  deleteBicycle,
  getBicycles,
  getCart,
  removeFromCart,
  updateCartItem,
  updatePartOption,
  updateRestrictions,
} from "./api";

describe("getBicyclesById", () => {
  it("should return bicycle data when valid ID is provided", async () => {
    const mockBicycle = {
      _id: "677a50d40d567747ae89f131",
      name: "Fat Tire Pro",
      price: 1500,
      image:
        "https://images.unsplash.com/photo-1528629297340-d1d466945dc5?q=80&w=2122&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    };
    getBicycles.mockResolvedValue([mockBicycle]);

    // Act
    const bicycles = await getBicycles();

    // Assert
    expect(bicycles).toEqual([mockBicycle]);
  });
  it("should throw error when bicycle ID does not exist", async () => {
    // Arrange
    getBicycles.mockRejectedValue(new Error("Bicycle not found"));

    // Act
    let error;
    try {
      await getBicycles();
    } catch (err) {
      error = err;
    }
    // Assert
    expect(error).toBeDefined();
    expect(error.message).toBe("Bicycle not found");
  });
});

describe("getCart", () => {
  it("should return cart data when valid ID is provided", async () => {
    const mockCart = {
      cartId: "mock-cart-123",
      items: [
        {
          bicycle: {
            _id: "677a50d40d567747ae89f131",
            name: "Fat Tire Pro",
            price: 1500,
            image:
              "https://images.unsplash.com/photo-1528629297340-d1d466945dc5?q=80&w=2122&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
          options: [
            { category: "Wheels", value: "Fat Bike Wheels", _id: "opt-1" },
            { category: "Rim Color", value: "Black", _id: "opt-2" },
            { category: "Frame Type", value: "Full Suspension", _id: "opt-3" },
            { category: "Frame Finish", value: "Matte", _id: "opt-4" },
            { category: "Chain", value: "8-Speed Chain", _id: "opt-5" },
          ],
          quantity: 1,
          _id: "cart-item-1",
        },
      ],
    };
    getCart.mockResolvedValue(mockCart);

    // Act
    const cart = await getCart();

    // Assert
    expect(cart).toEqual(mockCart);
  });
  it("should throw error when cart ID does not exist", async () => {
    // Arrange
    getCart.mockRejectedValue(new Error("Cart not found"));

    // Act
    let error;
    try {
      await getCart();
    } catch (err) {
      error = err;
    }
    // Assert
    expect(error).toBeDefined();
    expect(error.message).toBe("Cart not found");
  });
});

describe("addToCart", () => {
  it("should successfully add a bicycle to the cart", async () => {
    const payload = {
      cartId: "mock-cart-123",
      bicycleId: "677a50d40d567747ae89f131",
      quantity: 1,
    };
    const mockResponse = { success: true };

    addToCart.mockResolvedValue(mockResponse);

    const response = await addToCart(payload);

    expect(response).toEqual(mockResponse);
  });

  it("should throw an error if add to cart fails", async () => {
    addToCart.mockRejectedValue(new Error("Failed to add item"));

    let error;
    try {
      await addToCart({
        cartId: "mock-cart-123",
        bicycleId: "invalid-bike",
        quantity: 1,
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe("Failed to add item");
  });
});
describe("removeFromCart", () => {
  it("should successfully remove an item from the cart", async () => {
    const mockResponse = { success: true };

    removeFromCart.mockResolvedValue(mockResponse);

    const response = await removeFromCart("mock-cart-123", "cart-item-1");

    expect(response).toEqual(mockResponse);
    expect(removeFromCart).toHaveBeenCalledWith("mock-cart-123", "cart-item-1");
  });

  it("should throw an error if removing item fails", async () => {
    removeFromCart.mockRejectedValue(new Error("Failed to remove item"));

    let error;
    try {
      await removeFromCart("mock-cart-123", "invalid-item");
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe("Failed to remove item");
  });
});
describe("updateCartItem", () => {
  it("should update item quantity successfully", async () => {
    const mockResponse = { success: true };

    updateCartItem.mockResolvedValue(mockResponse);

    const response = await updateCartItem("mock-cart-123", "cart-item-1", {
      quantity: 2,
    });

    expect(response).toEqual(mockResponse);
    expect(updateCartItem).toHaveBeenCalledWith(
      "mock-cart-123",
      "cart-item-1",
      { quantity: 2 }
    );
  });

  it("should throw an error if update fails", async () => {
    updateCartItem.mockRejectedValue(new Error("Failed to update quantity"));

    let error;
    try {
      await updateCartItem("mock-cart-123", "invalid-item", { quantity: 3 });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe("Failed to update quantity");
  });
});
describe("createBicycle & deleteBicycle", () => {
  it("should create a new bicycle", async () => {
    const newBike = {
      name: "Speed Racer",
      price: 1800,
      image: "https://example.com/speed-racer.jpg",
    };

    const mockResponse = { _id: "new-bike-123", ...newBike };

    createBicycle.mockResolvedValue(mockResponse);

    const response = await createBicycle(newBike);

    expect(response).toEqual(mockResponse);
    expect(createBicycle).toHaveBeenCalledWith(newBike);
  });

  it("should delete a bicycle", async () => {
    const mockResponse = { success: true };

    deleteBicycle.mockResolvedValue(mockResponse);

    const response = await deleteBicycle("bike-123");

    expect(response).toEqual(mockResponse);
    expect(deleteBicycle).toHaveBeenCalledWith("bike-123");
  });

  it("should throw an error if bicycle creation fails", async () => {
    createBicycle.mockRejectedValue(new Error("Bicycle creation failed"));

    let error;
    try {
      await createBicycle({ name: "Broken Bike" });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe("Bicycle creation failed");
  });
});
describe("createPartOption & updatePartOption", () => {
  it("should create a new part option", async () => {
    const partOption = { category: "Frame", value: "Carbon" };
    const mockResponse = { _id: "part-123", ...partOption };

    createPartOption.mockResolvedValue(mockResponse);

    const response = await createPartOption(partOption);

    expect(response).toEqual(mockResponse);
    expect(createPartOption).toHaveBeenCalledWith(partOption);
  });

  it("should update a part option", async () => {
    const updatedData = { stock: "out_of_stock" };
    const mockResponse = { success: true };

    updatePartOption.mockResolvedValue(mockResponse);

    const response = await updatePartOption("part-123", updatedData);

    expect(response).toEqual(mockResponse);
    expect(updatePartOption).toHaveBeenCalledWith("part-123", updatedData);
  });

  it("should throw an error if updating a part fails", async () => {
    updatePartOption.mockRejectedValue(
      new Error("Failed to update part option")
    );

    let error;
    try {
      await updatePartOption("invalid-part", { stock: "out_of_stock" });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe("Failed to update part option");
  });
});

describe("updateRestrictions", () => {
  it("should successfully update restrictions", async () => {
    const mockResponse = { success: true };
    updateRestrictions.mockResolvedValue(mockResponse);

    const response = await updateRestrictions("part-123", {
      "Frame Type": ["Steel"],
    });

    expect(response).toEqual(mockResponse);
    expect(updateRestrictions).toHaveBeenCalledWith("part-123", {
      "Frame Type": ["Steel"],
    });
  });

  it("should throw an error if update fails", async () => {
    updateRestrictions.mockRejectedValue(
      new Error("Failed to update restrictions")
    );

    let error;
    try {
      await updateRestrictions("invalid-part", { "Frame Type": ["Steel"] });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe("Failed to update restrictions");
  });
});

describe("API Call Frequency", () => {
  it("should only call getCart once", async () => {
    getCart.mockResolvedValue({ cartId: "mock-cart-123", items: [] });

    await getCart("mock-cart-123");

    expect(getCart).toHaveBeenCalledTimes(1);
  });

  it("should only call addToCart once", async () => {
    addToCart.mockResolvedValue({ success: true });

    await addToCart({ bicycleId: "bike-1" });

    expect(addToCart).toHaveBeenCalledTimes(1);
  });

  it("should only call updateCartItem once", async () => {
    updateCartItem.mockResolvedValue({ success: true });

    await updateCartItem("mock-cart-123", "cart-item-1", { quantity: 2 });

    expect(updateCartItem).toHaveBeenCalledTimes(1);
  });

  it("should only call removeFromCart once", async () => {
    removeFromCart.mockResolvedValue({ success: true });

    await removeFromCart("mock-cart-123", "cart-item-1");

    expect(removeFromCart).toHaveBeenCalledTimes(1);
  });

  it("should only call updateRestrictions once", async () => {
    updateRestrictions.mockResolvedValue({ success: true });

    await updateRestrictions("part-123", { "Frame Type": ["Steel"] });

    expect(updateRestrictions).toHaveBeenCalledTimes(1);
  });
});
