const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const bodyParser = require("express");
const PartOption = require("../../models/partOption.model");
const validateCartItem = require("../../middleware/cartValidation.middleware");

let mongoServer;
let app;

beforeAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  app = express();
  app.use(bodyParser.json());

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  app.post("/test-cart", validateCartItem, (req, res) => {
    res.status(200).json({ message: "Cart item is valid" });
  });
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

describe("validateCartItem Middleware", () => {
  beforeEach(async () => {
    await PartOption.create({
      category: "Frame",
      value: "Aluminum",
      stock: "in_stock",
    });

    await PartOption.create({
      category: "Frame",
      value: "Carbon",
      stock: "out_of_stock",
    });

    await PartOption.create({
      category: "Brakes",
      value: "Disc",
      stock: "in_stock",
      restrictions: { Frame: ["Steel"] },
    });
  });

  afterEach(async () => {
    await PartOption.deleteMany({});
  });

  it("should allow valid cart items", async () => {
    const res = await request(app)
      .post("/test-cart")
      .send({
        options: [{ category: "Frame", value: "Aluminum" }],
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Cart item is valid");
  });

  it("should reject invalid part options", async () => {
    const res = await request(app)
      .post("/test-cart")
      .send({
        options: [{ category: "Frame", value: "Titanium" }],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      'Invalid selection: "Titanium" is not a valid option for Frame.'
    );
  });

  it("should reject out-of-stock part options", async () => {
    const res = await request(app)
      .post("/test-cart")
      .send({
        options: [{ category: "Frame", value: "Carbon" }],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      'Oops! "Carbon" in Frame is out of stock. Please choose another option.'
    );
  });

  it("should reject incompatible part options", async () => {
    const res = await request(app)
      .post("/test-cart")
      .send({
        options: [
          { category: "Frame", value: "Steel" },
          { category: "Brakes", value: "Disc" },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      'Invalid selection: "Steel" is not a valid option for Frame.'
    );
  });

  it("should handle unexpected errors gracefully", async () => {
    await mongoose.disconnect();

    const res = await request(app)
      .post("/test-cart")
      .send({
        options: [{ category: "Frame", value: "Aluminum" }],
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Validation failed");

    await mongoose.connect(mongoServer.getUri(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });
  it("should reject requests with missing options field", async () => {
    const res = await request(app).post("/test-cart").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Invalid request: options field is required."
    );
  });

  it("should reject requests with an empty options array", async () => {
    const res = await request(app).post("/test-cart").send({
      options: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid request: options cannot be empty.");
  });

  it("should allow multiple valid part options", async () => {
    const res = await request(app)
      .post("/test-cart")
      .send({
        options: [
          { category: "Frame", value: "Aluminum" },
          { category: "Brakes", value: "Disc" },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Cart item is valid");
  });

  it("should correctly handle a part option that exists but has no restrictions", async () => {
    await PartOption.create({
      category: "Tires",
      value: "Tubeless",
      stock: "in_stock",
    });

    const res = await request(app)
      .post("/test-cart")
      .send({
        options: [{ category: "Tires", value: "Tubeless" }],
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Cart item is valid");
  });
}, 20000);
