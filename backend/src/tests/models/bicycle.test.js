const mongoose = require("mongoose");
const Bicycle = require("../../models/bicycle.model");

describe("Bicycle Model", () => {
  it("should create a bicycle with valid fields", async () => {
    const bicycle = new Bicycle({
      name: "Urban Commuter",
      description: "Stylish bike for city commutes.",
      price: 800,
      image: "https://example.com/image.jpg",
      options: [
        { category: "Frame Type", values: ["Full Suspension", "Diamond"] },
      ],
    });

    const savedBicycle = await bicycle.save();
    expect(savedBicycle._id).toBeDefined();
    expect(savedBicycle.name).toBe("Urban Commuter");
  });

  it("should throw an error if required fields are missing", async () => {
    const bicycle = new Bicycle({});
    let err;
    try {
      await bicycle.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.price).toBeDefined();
  });
});
