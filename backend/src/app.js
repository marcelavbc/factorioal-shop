const express = require("express");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

connectDB();

// Routes
const bicycleRoutes = require("./routes/bicycle.routes");
app.use("/api/bicycles", bicycleRoutes);

const cartRoutes = require("./routes/cart.routes");
app.use("/api/cart", cartRoutes);

const partOptionRoutes = require("./routes/partOption.routes");
app.use("/api/part-options", partOptionRoutes);

app.get("/", (req, res) => {
  res.send("Bicycle Shop API is running...");
});

module.exports = app;
