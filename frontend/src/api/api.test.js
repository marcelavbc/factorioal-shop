import * as api from "./api";
import axios from "axios";

jest.mock("axios");

describe("getBicycleById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch a bicycle successfully", async () => {
    jest.spyOn(api, "getBicycleById");

    axios.get.mockResolvedValue({ data: { name: "Bicycle" } });

    const response = await api.getBicycleById("bicycle-123");

    expect(response).toEqual({ name: "Bicycle" });
    expect(axios.get).toHaveBeenCalledWith(
      "http://localhost:5001/api/bicycles/bicycle-123"
    );
    expect(api.getBicycleById).toHaveBeenCalledTimes(1);
  });
  it("should throw an error when fetching fails", async () => {
    jest.spyOn(api, "getBicycleById");

    axios.get.mockRejectedValue(new Error("Fetch failed"));

    await expect(api.getBicycleById("invalid-id")).rejects.toThrow(
      "Fetch failed"
    );

    expect(api.getBicycleById).toHaveBeenCalledTimes(1);
  });
});

describe("getCart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch the cart successfully", async () => {
    jest.spyOn(api, "getCart");

    axios.get.mockResolvedValue({ data: { items: [] } });

    const response = await api.getCart("cart-123");

    expect(response).toEqual({ items: [] });
    expect(axios.get).toHaveBeenCalledWith("http://localhost:5001/api/cart", {
      params: { cartId: "cart-123" },
    });
    expect(api.getCart).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when fetching fails", async () => {
    jest.spyOn(api, "getCart");

    axios.get.mockRejectedValue(new Error("Fetch failed"));

    await expect(api.getCart("invalid-id")).rejects.toThrow("Fetch failed");

    expect(api.getCart).toHaveBeenCalledTimes(1);
  });
});

describe("addToCart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should add an item to the cart successfully", async () => {
    jest.spyOn(api, "addToCart");

    axios.post.mockResolvedValue({ data: { success: true } });

    const response = await api.addToCart({ itemId: "item-123" });

    expect(response).toEqual({ success: true });
    expect(axios.post).toHaveBeenCalledWith("http://localhost:5001/api/cart", {
      itemId: "item-123",
    });
    expect(api.addToCart).toHaveBeenCalledTimes(1);
  });
  it("should throw an error when adding fails", async () => {
    jest.spyOn(api, "addToCart");

    axios.post.mockRejectedValue(new Error("Add failed"));

    await expect(api.addToCart({ itemId: "invalid-id" })).rejects.toThrow(
      "Add failed"
    );

    expect(api.addToCart).toHaveBeenCalledTimes(1);
  });
});

describe("removeFromCart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should remove an item from the cart successfully", async () => {
    jest.spyOn(api, "removeFromCart");

    axios.delete.mockResolvedValue({ data: { success: true } });

    const response = await api.removeFromCart("cart-123", "item-123");

    expect(response).toEqual({ success: true });
    expect(axios.delete).toHaveBeenCalledWith(
      "http://localhost:5001/api/cart/item-123",
      { data: { cartId: "cart-123" } }
    );
    expect(api.removeFromCart).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when removal fails", async () => {
    jest.spyOn(api, "removeFromCart");

    axios.delete.mockRejectedValue(new Error("Remove failed"));

    await expect(api.removeFromCart("cart-123", "invalid-id")).rejects.toThrow(
      "Remove failed"
    );

    expect(api.removeFromCart).toHaveBeenCalledTimes(1);
  });
});

describe("updateCartItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update the cart item successfully", async () => {
    jest.spyOn(api, "updateCartItem");

    axios.patch.mockResolvedValue({ data: { success: true } });

    const response = await api.updateCartItem("cart-123", "item-123", {
      quantity: 2,
    });

    expect(response).toEqual({ success: true });
    expect(axios.patch).toHaveBeenCalledWith(
      "http://localhost:5001/api/cart/item-123?cartId=cart-123",
      { quantity: 2 }
    );
    expect(api.updateCartItem).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when update fails", async () => {
    jest.spyOn(api, "updateCartItem");

    axios.patch.mockRejectedValue(new Error("Update failed"));

    await expect(
      api.updateCartItem("cart-123", "invalid-id", { quantity: 2 })
    ).rejects.toThrow("Update failed");

    expect(api.updateCartItem).toHaveBeenCalledTimes(1);
  });
});

describe("getPartOptions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch part options successfully", async () => {
    jest.spyOn(api, "getPartOptions");

    axios.get.mockResolvedValue({ data: [{ _id: "part-123" }] });

    const response = await api.getPartOptions();

    expect(response).toEqual([{ _id: "part-123" }]);
    expect(axios.get).toHaveBeenCalledWith(
      "http://localhost:5001/api/part-options"
    );
    expect(api.getPartOptions).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when fetching fails", async () => {
    jest.spyOn(api, "getPartOptions");

    axios.get.mockRejectedValue(new Error("Fetch failed"));

    await expect(api.getPartOptions()).rejects.toThrow("Fetch failed");

    expect(api.getPartOptions).toHaveBeenCalledTimes(1);
  });
});

describe("deletePartOption", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a part option successfully", async () => {
    jest.spyOn(api, "deletePartOption");

    axios.delete.mockResolvedValue({ data: { success: true } });

    const response = await api.deletePartOption("part-123");

    expect(response).toEqual({ success: true });
    expect(axios.delete).toHaveBeenCalledWith(
      "http://localhost:5001/api/part-options/part-123"
    );
    expect(api.deletePartOption).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when deletion fails", async () => {
    jest.spyOn(api, "deletePartOption");

    axios.delete.mockRejectedValue(new Error("Delete failed"));

    await expect(api.deletePartOption("invalid-id")).rejects.toThrow(
      "Delete failed"
    );

    expect(api.deletePartOption).toHaveBeenCalledTimes(1);
  });
});

describe("getBicycles", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch bicycles successfully", async () => {
    jest.spyOn(api, "getBicycles");

    axios.get.mockResolvedValue({ data: [{ _id: "bicycle-123" }] });

    const response = await api.getBicycles();

    expect(response).toEqual([{ _id: "bicycle-123" }]);
    expect(axios.get).toHaveBeenCalledWith(
      "http://localhost:5001/api/bicycles"
    );
    expect(api.getBicycles).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when fetching fails", async () => {
    jest.spyOn(api, "getBicycles");

    axios.get.mockRejectedValue(new Error("Fetch failed"));

    await expect(api.getBicycles()).rejects.toThrow("Fetch failed");

    expect(api.getBicycles).toHaveBeenCalledTimes(1);
  });
});

describe("deleteBicycle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a bicycle successfully", async () => {
    jest.spyOn(api, "deleteBicycle");

    axios.delete.mockResolvedValue({ data: { success: true } });

    const response = await api.deleteBicycle("bicycle-123");

    expect(response).toEqual({ success: true });
    expect(axios.delete).toHaveBeenCalledWith(
      "http://localhost:5001/api/bicycles/bicycle-123"
    );
    expect(api.deleteBicycle).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when deletion fails", async () => {
    jest.spyOn(api, "deleteBicycle");

    axios.delete.mockRejectedValue(new Error("Delete failed"));

    await expect(api.deleteBicycle("invalid-id")).rejects.toThrow(
      "Delete failed"
    );

    expect(api.deleteBicycle).toHaveBeenCalledTimes(1);
  });
});

describe("createBicycle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a bicycle successfully", async () => {
    jest.spyOn(api, "createBicycle");

    axios.post.mockResolvedValue({ data: { _id: "bicycle-123" } });

    const response = await api.createBicycle({ name: "Bicycle" });

    expect(response).toEqual({ _id: "bicycle-123" });
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:5001/api/bicycles",
      { name: "Bicycle" }
    );
    expect(api.createBicycle).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when creation fails", async () => {
    jest.spyOn(api, "createBicycle");

    axios.post.mockRejectedValue(new Error("Create failed"));

    await expect(api.createBicycle({ name: "Bicycle" })).rejects.toThrow(
      "Create failed"
    );

    expect(api.createBicycle).toHaveBeenCalledTimes(1);
  });
});

describe("updateBicycle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a bicycle successfully", async () => {
    jest.spyOn(api, "updateBicycle");

    axios.put.mockResolvedValue({ data: { _id: "bicycle-123" } });

    const response = await api.updateBicycle("bicycle-123", {
      name: "Bicycle",
    });

    expect(response).toEqual({ _id: "bicycle-123" });
    expect(axios.put).toHaveBeenCalledWith(
      "http://localhost:5001/api/bicycles/bicycle-123",
      { name: "Bicycle" }
    );
    expect(api.updateBicycle).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when update fails", async () => {
    jest.spyOn(api, "updateBicycle");

    axios.put.mockRejectedValue(new Error("Update failed"));

    await expect(
      api.updateBicycle("invalid-id", { name: "Bicycle" })
    ).rejects.toThrow("Update failed");

    expect(api.updateBicycle).toHaveBeenCalledTimes(1);
  });
});

describe("createPartOption", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a part option successfully", async () => {
    jest.spyOn(api, "createPartOption");

    axios.post.mockResolvedValue({ data: { _id: "part-123" } });

    const response = await api.createPartOption({ category: "Frame" });

    expect(response).toEqual({ _id: "part-123" });
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:5001/api/part-options",
      { category: "Frame" }
    );
    expect(api.createPartOption).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when creation fails", async () => {
    jest.spyOn(api, "createPartOption");

    axios.post.mockRejectedValue(new Error("Create failed"));

    await expect(api.createPartOption({ category: "Frame" })).rejects.toThrow(
      "Create failed"
    );

    expect(api.createPartOption).toHaveBeenCalledTimes(1);
  });
});

describe("updatePartOption", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a part option successfully", async () => {
    jest.spyOn(api, "updatePartOption");

    axios.put.mockResolvedValue({ data: { _id: "part-123" } });

    const response = await api.updatePartOption("part-123", {
      category: "Frame",
    });

    expect(response).toEqual({ _id: "part-123" });
    expect(axios.put).toHaveBeenCalledWith(
      "http://localhost:5001/api/part-options/part-123",
      { category: "Frame" }
    );
    expect(api.updatePartOption).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when update fails", async () => {
    jest.spyOn(api, "updatePartOption");

    axios.put.mockRejectedValue(new Error("Update failed"));

    await expect(
      api.updatePartOption("invalid-id", { category: "Frame" })
    ).rejects.toThrow("Update failed");

    expect(api.updatePartOption).toHaveBeenCalledTimes(1);
  });
});

describe("updateRestrictions", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("should update restrictions successfully", async () => {
    jest.spyOn(api, "updateRestrictions");

    axios.patch.mockResolvedValue({ data: { success: true } });

    const restrictionsPayload = { "Frame Type": ["Steel"] };

    const response = await api.updateRestrictions(
      "part-123",
      restrictionsPayload
    );

    expect(response).toEqual({ success: true });
    expect(axios.patch).toHaveBeenCalledWith(
      "http://localhost:5001/api/part-options/part-123/restrictions",
      { restrictions: restrictionsPayload }
    );
    expect(api.updateRestrictions).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when update fails", async () => {
    jest.spyOn(api, "updateRestrictions");

    axios.patch.mockRejectedValue(new Error("Update failed"));

    await expect(
      api.updateRestrictions("invalid-id", { "Frame Type": ["Steel"] })
    ).rejects.toThrow("Update failed");

    expect(api.updateRestrictions).toHaveBeenCalledTimes(1);
  });
});
