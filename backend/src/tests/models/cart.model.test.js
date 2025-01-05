const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Cart = require("../../models/cart.model");
const Bicycle = require("../../models/bicycle.model");

let mongoServer;

beforeAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error("Error during afterAll cleanup:", error);
  }
});

describe("Cart Model", () => {
  let testBicycle;

  beforeEach(async () => {
    testBicycle = await Bicycle.create({
      name: "Roadster",
      description: "A high-quality road bike.",
      price: 1200,
      image: "https://example.com/bike.jpg",
      partOptions: [],
    });
  });

  afterEach(async () => {
    await Cart.deleteMany({});
    await Bicycle.deleteMany({});
  });

  it("should create a cart with valid items", async () => {
    const cart = new Cart({
      items: [
        {
          bicycle: testBicycle._id,
          options: [
            { category: "Frame", value: "Carbon" },
            { category: "Brakes", value: "Disc" },
          ],
          quantity: 2,
        },
      ],
    });

    const savedCart = await cart.save();

    expect(savedCart._id).toBeDefined();
    expect(savedCart.items.length).toBe(1);
    expect(savedCart.items[0].bicycle.toString()).toBe(
      testBicycle._id.toString()
    );
    expect(savedCart.items[0].options.length).toBe(2);
    expect(savedCart.items[0].quantity).toBe(2);
  });

  it("should use the default quantity of 1 if not provided", async () => {
    const cart = new Cart({
      items: [
        {
          bicycle: testBicycle._id,
          options: [{ category: "Frame", value: "Aluminum" }],
        },
      ],
    });

    const savedCart = await cart.save();

    expect(savedCart.items[0].quantity).toBe(1);
  });

  it("should throw an error if bicycle field is missing", async () => {
    expect.assertions(1);
    const cart = new Cart({
      items: [
        {
          options: [{ category: "Frame", value: "Steel" }],
          quantity: 1,
        },
      ],
    });

    try {
      await cart.save();
    } catch (err) {
      expect(err.errors["items.0.bicycle"]).toBeDefined();
    }
  });

  it("should throw an error if an option is missing required fields", async () => {
    expect.assertions(1);
    const cart = new Cart({
      items: [
        {
          bicycle: testBicycle._id,
          options: [{ category: "Frame" }],
          quantity: 1,
        },
      ],
    });

    try {
      await cart.save();
    } catch (err) {
      expect(err.errors["items.0.options.0.value"]).toBeDefined();
    }
  });

  it("should allow an empty cart to be created", async () => {
    const cart = new Cart({ items: [] });
    const savedCart = await cart.save();

    expect(savedCart._id).toBeDefined();
    expect(savedCart.items.length).toBe(0);
  });
}, 10000);
