const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const bodyParser = require("express");
const Bicycle = require("../../models/bicycle.model");
const PartOption = require("../../models/partOption.model");
const bicycleRoutes = require("../../routes/bicycle.routes");

let mongoServer;
let app;
let testBicycle; // ✅ Declare here

beforeAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // ✅ Setup Express BEFORE connecting to MongoDB
  app = express();
  app.use(bodyParser.json());
  app.use("/bicycles", bicycleRoutes);

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // ✅ Ensure MongoDB is fully connected before running tests
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

describe("Bicycle Controllers", () => {
  let partOption1, partOption2;

  beforeEach(async () => {
    // ✅ Create PartOptions
    partOption1 = await PartOption.create({
      category: "Frame",
      value: "Carbon",
      stock: "in_stock",
    });

    partOption2 = await PartOption.create({
      category: "Brakes",
      value: "Disc",
      stock: "in_stock",
      restrictions: new Map([["Frame", ["Steel"]]]),
    });

    // ✅ Create Bicycle for testing
    testBicycle = await Bicycle.create({
      name: "Test Bike",
      description: "A test bicycle",
      price: 1000,
      image: "https://example.com/test-bike.jpg",
      partOptions: [partOption1._id, partOption2._id],
    });
  });

  afterEach(async () => {
    await Bicycle.deleteMany({});
    await PartOption.deleteMany({});
  });

  it("should fetch all bicycles (initially contains test bicycle)", async () => {
    const res = await request(app).get("/bicycles");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });
  it("should fetch a bicycle by ID", async () => {
    const res = await request(app).get(`/bicycles/${testBicycle._id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Test Bike");
  });
  it("should return 404 when fetching a non-existent bicycle", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/bicycles/${invalidId}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Bicycle not found");
  });
  it("should create a new bicycle", async () => {
    const res = await request(app)
      .post("/bicycles")
      .send({
        name: "Speedster",
        description: "A fast road bike",
        price: 1500,
        image: "https://example.com/speedster.jpg",
        partOptions: [partOption1._id, partOption2._id],
      });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Speedster");
    expect(res.body.partOptions.length).toBe(2);
  });
  it("should not create a bicycle with invalid part options", async () => {
    const invalidId = new mongoose.Types.ObjectId(); // Random invalid ID
    const res = await request(app)
      .post("/bicycles")
      .send({
        name: "Invalid Bike",
        description: "Should fail",
        price: 1200,
        partOptions: [invalidId],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Some part options are invalid");
  });
  it("should update a bicycle successfully", async () => {
    const res = await request(app)
      .put(`/bicycles/${testBicycle._id}`)
      .send({
        name: "Updated Bike",
        description: "Updated description",
        price: 1100,
        image: "https://example.com/updated-bike.jpg",
        partOptions: [partOption1._id], // Change part options
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Bike");
    expect(res.body.price).toBe(1100);
  });
  it("should return 404 when deleting a non-existent bicycle", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/bicycles/${invalidId}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Bicycle not found");
  });

  it("should return 400 when passing an invalid ID format", async () => {
    const res = await request(app).get(`/bicycles/invalid_id`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid bicycle ID");
  });

  it("should return 500 if fetching bicycles fails", async () => {
    jest
      .spyOn(Bicycle, "find")
      .mockRejectedValue(new Error("Database failure"));

    const res = await request(app).get("/bicycles");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Failed to fetch bicycles");
  });
  it("should return 500 if creating a bicycle fails", async () => {
    jest
      .spyOn(Bicycle.prototype, "save")
      .mockRejectedValue(new Error("Database failure"));

    const res = await request(app)
      .post("/bicycles")
      .send({
        name: "Fail Bike",
        description: "This should fail",
        price: 1200,
        partOptions: [partOption1._id],
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Failed to create bicycle");
  });
  it("should return 500 if updating a bicycle fails", async () => {
    jest
      .spyOn(Bicycle, "findByIdAndUpdate")
      .mockRejectedValue(new Error("Database failure"));

    const res = await request(app)
      .put(`/bicycles/${testBicycle._id}`)
      .send({
        name: "Updated Bike",
        description: "Updated description",
        price: 1100,
        partOptions: [partOption1._id],
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Failed to update bicycle");
  });
  it("should return 500 if deleting a bicycle fails", async () => {
    jest
      .spyOn(Bicycle, "findByIdAndDelete")
      .mockRejectedValue(new Error("Database failure"));

    const res = await request(app).delete(`/bicycles/${testBicycle._id}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Failed to delete bicycle");
  });

  it("should return 400 if trying to delete with an invalid ID format", async () => {
    const res = await request(app).delete(`/bicycles/invalid_id`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid bicycle ID");
  });
}, 20000);
