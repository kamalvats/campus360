const mongoose = require("mongoose");
require("./assistant/index")
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is missing in .env file");
  }

  await mongoose.connect(uri);
  console.log("✅ MongoDB connected successfully");
};

module.exports = connectDB;
