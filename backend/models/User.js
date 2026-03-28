const mongoose = require("mongoose");

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

// Export model
module.exports = mongoose.model("User", UserSchema);