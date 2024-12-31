const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Use in-memory MongoDB URI for testing
    const mongoURI =
      process.env.NODE_ENV === "test" && global.__MONGO_URI__
        ? global.__MONGO_URI__ // Set by MongoMemoryServer in tests
        : process.env.MONGO_URI; // Default MongoDB URI for development/production

    if (!mongoURI) {
      throw new Error("MongoDB URI is not defined");
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected successfully.");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
