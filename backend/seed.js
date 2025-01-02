// Import required libraries and models
const mongoose = require("mongoose");
const Bicycle = require("./src/models/bicycle.model");
const PartOption = require("./src/models/partOption.model");
require("dotenv").config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB.");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

// Seed bicycles and part options
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Bicycle.deleteMany({});
    await PartOption.deleteMany({});

    console.log("Existing data cleared.");

    // Create part options with restrictions
    const partOptions = [
      {
        category: "Frame Type",
        value: "Full Suspension",
        stock: "in_stock",
        restrictions: { Wheels: ["Mountain Wheels"] },
      },
      {
        category: "Frame Type",
        value: "Diamond",
        stock: "in_stock",
      },
      {
        category: "Frame Type",
        value: "Step-Through",
        stock: "in_stock",
        restrictions: { "Rim Color": ["Blue"] },
      },

      { category: "Frame Finish", value: "Matte", stock: "in_stock" },
      { category: "Frame Finish", value: "Shiny", stock: "in_stock" },

      {
        category: "Wheels",
        value: "Road Wheels",
        stock: "in_stock",
      },
      {
        category: "Wheels",
        value: "Mountain Wheels",
        stock: "in_stock",
        restrictions: { "Frame Type": ["Step-Through"] },
      },
      {
        category: "Wheels",
        value: "Fat Bike Wheels",
        stock: "in_stock",
        restrictions: { "Rim Color": ["Red"] },
      },

      { category: "Rim Color", value: "Red", stock: "in_stock" },
      { category: "Rim Color", value: "Black", stock: "in_stock" },
      { category: "Rim Color", value: "Blue", stock: "in_stock" },

      { category: "Chain", value: "Single-Speed Chain", stock: "in_stock" },
      { category: "Chain", value: "8-Speed Chain", stock: "in_stock" },
    ];

    const createdPartOptions = await PartOption.insertMany(partOptions);
    console.log("Part options seeded:", createdPartOptions);

    // Create bicycles
    const bicycles = [
      {
        name: "Urban Commuter",
        description: "Stylish bike for city commutes.",
        price: 800,
        image:
          "https://plus.unsplash.com/premium_photo-1682430478591-ffae0132d88e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        options: [
          { category: "Frame Type", values: ["Full Suspension", "Diamond"] },
          { category: "Frame Finish", values: ["Matte", "Shiny"] },
          { category: "Wheels", values: ["Road Wheels"] },
          { category: "Rim Color", values: ["Red", "Black"] },
          { category: "Chain", values: ["Single-Speed Chain"] },
        ],
      },
      {
        name: "Mountain Explorer",
        description: "Perfect for off-road adventures.",
        price: 1200,
        image:
          "https://plus.unsplash.com/premium_photo-1684096758573-cd4acd2a12c4?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        options: [
          { category: "Frame Type", values: ["Full Suspension"] },
          { category: "Frame Finish", values: ["Matte"] },
          { category: "Wheels", values: ["Mountain Wheels"] },
          { category: "Rim Color", values: ["Black"] },
          { category: "Chain", values: ["8-Speed Chain"] },
        ],
      },
      {
        name: "Beach Cruiser",
        description: "Relaxed rides along the beach.",
        price: 600,
        image:
          "https://images.unsplash.com/photo-1528784351875-d797d86873a1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        options: [
          { category: "Frame Type", values: ["Step-Through"] },
          { category: "Frame Finish", values: ["Shiny"] },
          { category: "Wheels", values: ["Road Wheels", "Mountain Wheels"] },
          { category: "Rim Color", values: ["Blue"] },
          { category: "Chain", values: ["Single-Speed Chain"] },
        ],
      },
      {
        name: "Fat Tire Pro",
        description: "Conquer the toughest terrains with style.",
        price: 1500,
        image:
          "https://images.unsplash.com/photo-1528629297340-d1d466945dc5?q=80&w=2122&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        options: [
          { category: "Frame Type", values: ["Full Suspension"] },
          { category: "Frame Finish", values: ["Matte"] },
          { category: "Wheels", values: ["Fat Bike Wheels"] },
          { category: "Rim Color", values: ["Black"] },
          { category: "Chain", values: ["8-Speed Chain"] },
        ],
      },
    ];

    const createdBicycles = await Bicycle.insertMany(bicycles);
    console.log("Bicycles seeded:", createdBicycles);

    console.log("Database seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

connectDB().then(seedDatabase);
