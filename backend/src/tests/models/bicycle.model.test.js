const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
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

describe("Bicycle Model", () => {
  it("should create a bicycle with valid fields", async () => {
    const bicycle = new Bicycle({
      name: "Urban Commuter",
      description: "Stylish bike for city commutes.",
      price: 800,
      image: "https://example.com/image.jpg",
      partOptions: [],
    });

    const savedBicycle = await bicycle.save();
    expect(savedBicycle._id).toBeDefined();
    expect(savedBicycle.name).toBe("Urban Commuter");
  });

  it("should throw a validation error if required fields are missing", async () => {
    expect.assertions(3);
    try {
      await new Bicycle({}).save();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.errors.name).toBeDefined();
      expect(err.errors.price).toBeDefined();
    }
  });
}, 10000);
