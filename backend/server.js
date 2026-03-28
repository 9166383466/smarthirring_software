const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const User = require("./models/User");

const app = express();

// ================= MIDDLEWARE =================
// CORS ko allow karna zaroori hai taaki Vercel frontend isse baat kar sake
app.use(cors());
app.use(express.json());

// ================= MULTER =================
const upload = multer({ dest: "uploads/" });

// ================= MONGODB (Atlas Compatibility) =================
// Render ke Environment Variables se MONGO_URI uthayega
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/resumeDB";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("MongoDB Connection Error: ", err));

// ================= ROUTES =================

// Root Route (Check karne ke liye ki backend live hai ya nahi)
app.get("/", (req, res) => {
  res.send("Smart Hiring Backend is running 🚀");
});

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "All fields required ❌" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists ❌" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.json({ message: "User Registered ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found ❌" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password ❌" });

    res.json({ message: "Login Successful ✅", user: { email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPLOAD & AI ANALYSIS
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded ❌" });

    const formData = new FormData();
    formData.append("resume", fs.createReadStream(req.file.path));

    // Flask AI URL ko Environment variable se uthayenge
    const AI_URL = process.env.FLASK_API_URL || "http://127.0.0.1:8000/analyze";

    const response = await axios.post(AI_URL, formData, {
      headers: formData.getHeaders(),
    });

    fs.unlinkSync(req.file.path); // File delete karein analysis ke baad
    res.json(response.data);

  } catch (err) {
    console.error("AI Error:", err.message);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Error in AI processing ❌" });
  }
});

// GET USERS
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, { email: 1, _id: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SERVER (Dynamic Port for Render) =================
const PORT = process.env.PORT || 10000; 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});