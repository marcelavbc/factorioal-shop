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
    await Bicycle.deleteMany({});
    await PartOption.deleteMany({});
    console.log("Existing data cleared.");

    // Create part options with `  restrictions`
    const partOptionsData = [
      {
        category: "Frame Type",
        value: "Full Suspension",
        stock: "in_stock",
        restrictions: {},
      },
      {
        category: "Frame Type",
        value: "Diamond",
        stock: "in_stock",
        restrictions: {},
      },
      {
        category: "Frame Type",
        value: "Step-Through",
        stock: "in_stock",
        restrictions: {},
      },

      {
        category: "Frame Finish",
        value: "Matte",
        stock: "in_stock",
        restrictions: {},
      },
      {
        category: "Frame Finish",
        value: "Shiny",
        stock: "in_stock",
        restrictions: {},
      },

      {
        category: "Wheels",
        value: "Road Wheels",
        stock: "in_stock",
        restrictions: {},
      },
      {
        category: "Wheels",
        value: "Mountain Wheels",
        stock: "in_stock",
        restrictions: { "Frame Type": ["Full Suspension"] },
      },
      {
        category: "Wheels",
        value: "Fat Bike Wheels",
        stock: "in_stock",
        restrictions: { "Rim Color": ["Red"] },
      },
      {
        category: "Rim Color",
        value: "Red",
        stock: "in_stock",
        restrictions: {},
      },
      {
        category: "Rim Color",
        value: "Black",
        stock: "in_stock",
        restrictions: {},
      },
      {
        category: "Rim Color",
        value: "Blue",
        stock: "in_stock",
        restrictions: {},
      },

      {
        category: "Chain",
        value: "Single-Speed Chain",
        stock: "in_stock",
        restrictions: {},
      },
      {
        category: "Chain",
        value: "8-Speed Chain",
        stock: "in_stock",
        restrictions: {},
      },
    ];

    const createdPartOptions = await PartOption.insertMany(partOptionsData);
    console.log("✅ Part options seeded:", createdPartOptions);

    // 🔹 Create a mapping of category -> ObjectId
    const partOptionMap = createdPartOptions.reduce((acc, option) => {
      acc[`${option.category}_${option.value}`] = option._id;
      return acc;
    }, {});

    // 🔹 Create bicycles using `partOptions` references
    const bicyclesData = [
      {
        name: "Urban Commuter",
        description: "Stylish bike for city commutes.",
        price: 800,
        image:
          "https://plus.unsplash.com/premium_photo-1682430478591-ffae0132d88e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        partOptions: [
          partOptionMap["Frame Type_Full Suspension"],
          partOptionMap["Frame Type_Diamond"],
          partOptionMap["Frame Finish_Matte"],
          partOptionMap["Frame Finish_Shiny"],
          partOptionMap["Wheels_Road Wheels"],
          partOptionMap["Wheels_Mountain Wheels"],
          partOptionMap["Rim Color_Red"],
          partOptionMap["Rim Color_Black"],
          partOptionMap["Chain_Single-Speed Chain"],
        ],
      },
      {
        name: "Mountain Explorer",
        description: "Perfect for off-road adventures.",
        price: 1200,
        image:
          "https://plus.unsplash.com/premium_photo-1684096758573-cd4acd2a12c4?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        partOptions: [
          partOptionMap["Frame Type_Full Suspension"],
          partOptionMap["Frame Finish_Matte"],
          partOptionMap["Wheels_Mountain Wheels"],
          partOptionMap["Wheels_Road Wheels"],
          partOptionMap["Rim Color_Black"],
          partOptionMap["Rim Color_Red"],
          partOptionMap["Chain_8-Speed Chain"],
        ],
      },
      {
        name: "Fat Tire Pro",
        description: "Conquer the toughest terrains with style.",
        price: 1500,
        image:
          "https://images.unsplash.com/photo-1528629297340-d1d466945dc5?q=80&w=2122&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        partOptions: [
          partOptionMap["Frame Type_Full Suspension"],
          partOptionMap["Frame Type_Diamond"],
          partOptionMap["Frame Finish_Matte"],
          partOptionMap["Wheels_Fat Bike Wheels"],
          partOptionMap["Wheels_Road Wheels"],
          partOptionMap["Rim Color_Black"],
          partOptionMap["Rim Color_Red"],
          partOptionMap["Rim Color_Blue"],
          partOptionMap["Chain_8-Speed Chain"],
        ],
      },
      {
        name: "Speed Racer",
        description: "Ultra-lightweight bike for high-speed rides.",
        price: 2000,
        image:
          "https://plus.unsplash.com/premium_photo-1684820878202-52781d8e0ea9?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        partOptions: [
          partOptionMap["Frame Type_Diamond"],
          partOptionMap["Frame Finish_Shiny"],
          partOptionMap["Wheels_Road Wheels"],
          partOptionMap["Rim Color_Red"],
          partOptionMap["Chain_8-Speed Chain"],
        ],
      },
    ];

    const createdBicycles = await Bicycle.insertMany(bicyclesData);
    console.log("🚲 Bicycles seeded:", createdBicycles);

    console.log("✅ Database seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
};

connectDB().then(seedDatabase);
