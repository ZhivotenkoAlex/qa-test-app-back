const mongoose = require("mongoose");

require("dotenv").config();
const uriDB = process.env.URI_DB;

const db = mongoose.connect(uriDB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.connection.on("connected", () => {
  console.log("Database connection successful");
});

mongoose.connection.on("error", (e) => {
  console.log(`Connection error: ${e.message}`);
});

mongoose.connection.on("disconnected", () => {
  console.log("Database disconnected");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();

  console.log("Connection to DB closed and app terminated");

  process.exit(1);
});

module.exports = db;
