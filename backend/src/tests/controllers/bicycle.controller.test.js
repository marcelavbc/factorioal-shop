const request = require("supertest");
const app = require("../../app");
const Bicycle = require("../../models/bicycle.model");

describe("Bicycle Controller", () => {
  let testBicycle;

  // Clear database before each test
  beforeEach(async () => {
    await Bicycle.deleteMany({});
    // Insert a test bicycle into the database
    testBicycle = await Bicycle.create({
      name: "Urban Commuter",
      description: "Stylish bike for city commutes.",
      price: 800,
    });
  });

  // Close database connection after all tests
  afterAll(async () => {
    await Bicycle.deleteMany({});
  });

  it("should fetch all bicycles", async () => {
    const response = await request(app).get("/api/bicycles");

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("should fetch a single bicycle by ID", async () => {
    const response = await request(app).get(
      `/api/bicycles/${testBicycle._id.toString()}`
    );

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Urban Commuter");
  });

  it("should create a new bicycle", async () => {
    const response = await request(app).post("/api/bicycles").send({
      name: "Mountain Rider",
      description: "Durable bike for mountain trails.",
      price: 1200,
    });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Mountain Rider");
  });

  it("should delete a bicycle", async () => {
    const response = await request(app).delete(
      `/api/bicycles/${testBicycle._id}`
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Bicycle deleted successfully");
  });
});
