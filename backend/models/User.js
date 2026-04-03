const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  history: [
    {
      score: Number,
      skills: [String],
      explanation: String,        // Naya
      recommendations: [String],  // Naya
      how_to_improve: String,     // Naya
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("User", UserSchema);