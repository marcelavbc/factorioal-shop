const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const PartOption = require("../../models/partOption.model");

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

describe("PartOption Model", () => {
  afterEach(async () => {
    await PartOption.deleteMany({});
  });

  it("should create a valid part option", async () => {
    const partOption = new PartOption({
      category: "Brakes",
      value: "Disc Brakes",
      stock: "in_stock",
      restrictions: new Map([
        ["Frame", ["Carbon", "Steel"]],
        ["Brakes", ["Hydraulic Only"]],
      ]),
    });

    const savedPartOption = await partOption.save();

    expect(savedPartOption._id).toBeDefined();
    expect(savedPartOption.category).toBe("Brakes");
    expect(savedPartOption.value).toBe("Disc Brakes");
    expect(savedPartOption.stock).toBe("in_stock");

    // Check restrictions map
    expect(savedPartOption.restrictions.get("Frame")).toEqual([
      "Carbon",
      "Steel",
    ]);
    expect(savedPartOption.restrictions.get("Brakes")).toEqual([
      "Hydraulic Only",
    ]);
  });

  it("should throw an error if required fields are missing", async () => {
    expect.assertions(3);
    const partOption = new PartOption({});

    try {
      await partOption.save();
    } catch (err) {
      expect(err.errors.category).toBeDefined();
      expect(err.errors.value).toBeDefined();
      expect(err.errors.stock).toBeDefined();
    }
  });

  it("should enforce stock field to only allow 'in_stock' or 'out_of_stock'", async () => {
    expect.assertions(1);
    const partOption = new PartOption({
      category: "Frame",
      value: "Aluminum",
      stock: "unknown_stock", // Invalid value
    });

    try {
      await partOption.save();
    } catch (err) {
      expect(err.errors.stock).toBeDefined();
    }
  });

  it("should correctly store and retrieve restrictions as a Map", async () => {
    const partOption = new PartOption({
      category: "Handlebars",
      value: "Drop Bars",
      stock: "out_of_stock",
      restrictions: new Map([["Frame", ["Steel", "Titanium"]]]),
    });

    const savedPartOption = await partOption.save();
    expect(savedPartOption.restrictions.get("Frame")).toEqual([
      "Steel",
      "Titanium",
    ]);
  });
}, 10000);
