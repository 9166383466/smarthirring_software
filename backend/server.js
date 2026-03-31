require('dotenv').config();
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const User = require("./models/User");

const app = express();

// 1. MIDDLEWARE (Security & Data Parsing)
app.use(cors());
app.use(express.json());

// 2. MULTER (File handling setup)
const upload = multer({ dest: "uploads/" });

// 3. DATABASE CONNECTION
const mongoURI = process.env.MONGO_URI;
if (mongoURI) {
  mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB Connected ✅"))
    .catch((err) => console.log("MongoDB Connection Error: ❌", err));
}

// 4. ROUTES

// --- Health Check ---
app.get("/", (req, res) => {
  res.send("Smart Hiring Backend is Live and Running! 🚀");
});

// --- ROUTE 1: AI RESUME UPLOAD ---
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File missing" });

    const AI_URL = process.env.AI_SERVICE_URL; 
    if (!AI_URL) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: "AI_SERVICE_URL not set in Render Environment" });
    }

    // AI Service ko file bhejne ke liye taiyari
    const formData = new FormData();
    formData.append("resume", fs.createReadStream(req.file.path));

    const response = await axios.post(AI_URL, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 60000 // 1 minute wait for AI response
    });

    const aiResult = response.data;

    // DATABASE SAVING: Agar user logged-in hai toh history save karo
    if (req.body.email) {
      await User.findOneAndUpdate(
        { email: req.body.email },
        { 
          $push: { 
            history: { 
              score: aiResult.score,
              skills: aiResult.skills,
              recommended_jobs: aiResult.recommended_jobs,
              date: new Date() 
            } 
          } 
        }
      );
      console.log(`History saved for: ${req.body.email} ✅`);
    }

    // Cleanup: File delete karo server se
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    
    res.json(aiResult);

  } catch (err) {
    console.error("Upload Error:", err.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "AI Processing Failed", details: err.message });
  }
});

// --- ROUTE 2: USER REGISTRATION ---
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    
    res.json({ message: "Registered Successfully ✅" });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// --- ROUTE 3: USER LOGIN ---
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    
    // Yahan hum user ka sara data (including history) bhej rahe hain
    res.json({ 
      message: "Login Successful", 
      user: { 
        email: user.email,
        history: user.history 
      } 
    });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// 5. SERVER START
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`-----------------------------------`);
  console.log(`Server running on Port: ${PORT} 🚀`);
  console.log(`-----------------------------------`);
});