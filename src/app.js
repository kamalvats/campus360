const express = require("express");
const { sendError } = require("./utiles/response");
const cors = require("cors");
// ✅ module routes
const userRoutes = require("./api/user/routes");

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// routes
app.get("/", (req, res) => {
  res.json({ message: "✅ API is running..." });
});

app.use("/api/users", userRoutes);

// 404 handler
app.use((req, res) => {
  return sendError(res, 404, "Route not found");
});

module.exports = app;
