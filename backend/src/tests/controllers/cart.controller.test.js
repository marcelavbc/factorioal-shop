const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const bodyParser = require("express");
const Cart = require("../../models/cart.model");
const Bicycle = require("../../models/bicycle.model");
const PartOption = require("../../models/partOption.model");
const cartRoutes = require("../../routes/cart.routes");

let mongoServer;
let app;
let testBicycle, testCart;

beforeAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Set up Express app BEFORE database connection
  app = express();
  app.use(bodyParser.json());
  app.use("/cart", cartRoutes);

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Ensure MongoDB is ready before running tests
  await new Promise((resolve) => setTimeout(resolve, 1000));
});

afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error("Error during afterAll cleanup:", error);
  }
});

describe("Cart Controllers", () => {
  beforeEach(async () => {
    // Create test PartOptions
    const partOptionFrameAluminum = await PartOption.create({
      category: "Frame",
      value: "Aluminum",
      stock: "in_stock",
    });
    const partOptionFrameCarbon = await PartOption.create({
      category: "Frame",
      value: "Carbon", // ✅ Add this to the database
      stock: "in_stock",
    });

    testBicycle = await Bicycle.create({
      name: "Test Bike",
      description: "A test bicycle",
      price: 1000,
      image: "https://example.com/test-bike.jpg",
      partOptions: [partOptionFrameAluminum._id, partOptionFrameCarbon._id],
    });

    testCart = await Cart.create({
      items: [
        {
          bicycle: testBicycle._id,
          options: [{ category: "Frame", value: "Aluminum" }],
          quantity: 1,
        },
      ],
    });
  });

  afterEach(async () => {
    await Cart.deleteMany({});
    await Bicycle.deleteMany({});
  });

  it("should add a bicycle to a new cart", async () => {
    const res = await request(app)
      .post("/cart")
      .send({
        bicycleId: testBicycle._id,
        options: [{ category: "Frame", value: "Aluminum" }],
        quantity: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body.cartId).toBeDefined();
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].bicycle).toBe(testBicycle._id.toString());
  });
  it("should add a bicycle to an existing cart", async () => {
    const res = await request(app)
      .post("/cart")
      .send({
        cartId: testCart._id,
        bicycleId: testBicycle._id,
        options: [{ category: "Frame", value: "Carbon" }],
        quantity: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body.cartId).toBe(testCart._id.toString());
    expect(res.body.items.length).toBe(2);
  });
  it("should fetch cart contents", async () => {
    const res = await request(app).get(`/cart?cartId=${testCart._id}`);
    expect(res.status).toBe(200);
    expect(res.body.cartId).toBe(testCart._id.toString());
    expect(res.body.items.length).toBe(1);
  });
  it("should return an empty cart if no cartId is provided", async () => {
    const res = await request(app).get("/cart");
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(0);
    expect(res.body.message).toBe(
      "Your cart is empty. Please add items to your cart."
    );
  });
  it("should return 404 if cart not found", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/cart?cartId=${invalidId}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Cart not found");
  });

  it("should update cart item quantity", async () => {
    const res = await request(app)
      .patch(`/cart/${testCart.items[0]._id}?cartId=${testCart._id}`)
      .send({ quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(3);
  });

  it("should return 404 when updating an item in a non-existent cart", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .patch(`/cart/${testCart.items[0]._id}?cartId=${invalidId}`)
      .send({ quantity: 2 });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Cart not found to update");
  });
  it("should return 404 when updating a non-existent cart item", async () => {
    const invalidItemId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .patch(`/cart/${invalidItemId}?cartId=${testCart._id}`)
      .send({ quantity: 2 });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Item not found in cart");
  });
  it("should return 400 when updating cart item with invalid quantity", async () => {
    const res = await request(app)
      .patch(`/cart/${testCart.items[0]._id}?cartId=${testCart._id}`)
      .send({ quantity: 0 });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Quantity must be at least 1.");
  });

  it("should remove a cart item", async () => {
    const res = await request(app)
      .delete(`/cart/${testCart.items[0]._id}`)
      .send({ cartId: testCart._id });

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(0);
  });

  it("should return 404 when removing an item from a non-existent cart", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/cart/${testCart.items[0]._id}`)
      .send({ cartId: invalidId });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Cart not found");
  });
  it("should return 400 when removing an item without a cartId", async () => {
    const res = await request(app).delete(`/cart/${testCart.items[0]._id}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Cart ID and Item ID are required");
  });
}, 20000);
