const mongoose = require("mongoose");

// History Schema (Ek user ke kayi saare scans ho sakte hain)
const ScanHistorySchema = new mongoose.Schema({
  score: { 
    type: Number, 
    default: 0 
  },
  skills: { 
    type: [String], 
    default: [] 
  },
  explanation: { 
    type: String, 
    default: "Analysis pending..." 
  },
  recommendations: { 
    type: [String], 
    default: [] 
  },
  how_to_improve: { 
    type: String, 
    default: "" 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
});

// Main User Schema
const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  history: [ScanHistorySchema] // Sabhi scans yahan save honge
});

module.exports = mongoose.model("User", UserSchema);