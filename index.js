const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const User = require("./models/User");
const app = express();
// Add middleware to parse JSON bodies
app.use(express.json());
const cors = require("cors");
app.use(cors()); // Allow requests from http://localhost:3000

const PORT = process.env.PORT || 5000;

mongoose.connect(
  "mongodb+srv://root:root@cluster0.volyd4f.mongodb.net/somnath02"
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

//Available Routes
app.use("/api/auth", require("./routes/auth"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
