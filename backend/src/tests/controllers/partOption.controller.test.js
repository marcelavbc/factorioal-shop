const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const bodyParser = require("express");
const PartOption = require("../../models/partOption.model");
const partOptionRoutes = require("../../routes/partOption.routes");

let mongoServer;
let app;
let testPartOption;

beforeAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Set up Express app BEFORE database connection
  app = express();
  app.use(bodyParser.json());
  app.use("/part-options", partOptionRoutes);

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

describe("PartOption Controllers", () => {
  beforeEach(async () => {
    testPartOption = await PartOption.create({
      category: "Frame",
      value: "Carbon",
      stock: "in_stock",
      restrictions: {
        Brakes: ["Disc"],
      },
    });
  });

  afterEach(async () => {
    await PartOption.deleteMany({});
  });

  it("should add a new part option", async () => {
    const res = await request(app).post("/part-options").send({
      category: "Brakes",
      value: "Disc",
      stock: "in_stock",
    });

    expect(res.status).toBe(201);
    expect(res.body._id).toBeDefined();
    expect(res.body.category).toBe("Brakes");
    expect(res.body.value).toBe("Disc");
  });

  it("should fetch all part options", async () => {
    const res = await request(app).get("/part-options");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].category).toBe("Frame");
  });

  it("should update a part option", async () => {
    const res = await request(app)
      .put(`/part-options/${testPartOption._id}`)
      .send({
        category: "Wheels",
        value: "Tubeless",
      });

    expect(res.status).toBe(200);
    expect(res.body.category).toBe("Wheels");
    expect(res.body.value).toBe("Tubeless");
  });

  it("should return 404 when updating a non-existent part option", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/part-options/${invalidId}`)
      .send({ category: "Frame" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Part option not found");
  });

  it("should update restrictions for a part option", async () => {
    const res = await request(app)
      .patch(`/part-options/${testPartOption._id}/restrictions`)
      .send({
        restrictions: {
          Frame: ["Steel"],
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.updatedOption.restrictions.Frame).toEqual(["Steel"]);
  });

  it("should delete a part option", async () => {
    const res = await request(app).delete(
      `/part-options/${testPartOption._id}`
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Part option removed successfully");

    // Verify it's gone
    const check = await PartOption.findById(testPartOption._id);
    expect(check).toBeNull();
  });

  it("should return 404 when deleting a non-existent part option", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/part-options/${invalidId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Part option not found");
  });
  it("should return 400 when creating a part option without required fields", async () => {
    const res = await request(app).post("/part-options").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });

  it("should return 400 when trying to create a duplicate part option", async () => {
    const res = await request(app).post("/part-options").send({
      category: "Frame",
      value: "Carbon",
      stock: "in_stock",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Part option already exists");
  });

  it("should return 400 when updating a part option with invalid fields", async () => {
    const res = await request(app)
      .put(`/part-options/${testPartOption._id}`)
      .send({
        category: "",
        value: "",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid update fields");
  });

  it("should return 400 when updating a part option with an invalid ID format", async () => {
    const res = await request(app).put(`/part-options/invalid_id`).send({
      category: "Frame",
      value: "Aluminum",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid part option ID");
  });

  it("should return 500 when fetching part options fails", async () => {
    jest
      .spyOn(PartOption, "find")
      .mockRejectedValue(new Error("Database failure"));

    const res = await request(app).get("/part-options");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Failed to fetch part options");
  });

  it("should return 500 when creating a part option fails", async () => {
    jest
      .spyOn(PartOption.prototype, "save")
      .mockRejectedValue(new Error("Database failure"));

    const res = await request(app).post("/part-options").send({
      category: "Brakes",
      value: "Disc",
      stock: "in_stock",
    });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Failed to add part option");
  });

  it("should return 500 when updating a part option fails", async () => {
    jest
      .spyOn(PartOption, "findById")
      .mockRejectedValue(new Error("Database failure"));

    const res = await request(app)
      .put(`/part-options/${testPartOption._id}`)
      .send({
        category: "Frame",
        value: "Aluminum",
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Failed to update part option");
  });

  it("should return 500 when deleting a part option fails", async () => {
    jest
      .spyOn(PartOption, "findByIdAndDelete")
      .mockRejectedValue(new Error("Database failure"));

    const res = await request(app).delete(
      `/part-options/${testPartOption._id}`
    );

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Failed to remove part option");
  });
}, 20000);
