const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
  },
  avatar: {
    type: String,
  },
  domain: {
    type: String,
  },
  available: {
    type: Boolean,
    default: false,
  },
});
const User = mongoose.model("user", userSchema);
module.exports = User;
