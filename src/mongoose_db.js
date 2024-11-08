const mongoose = require("mongoose");
const env = require("dotenv");

env.config();

mongoose
  .connect(process.env.MONGODB_URI_GRADES)
  .then(() => console.log("[Mongo] Connected to MongoDB"))
  .catch((err) => console.error(err));

module.exports = mongoose;