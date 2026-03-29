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

// CORs update for Vercel
app.use(cors());
app.use(express.json());

// MULTER
const upload = multer({ dest: "uploads/" });

// MONGO
const mongoURI = process.env.MONGO_URI;
if (mongoURI) {
    mongoose.connect(mongoURI).then(() => console.log("MongoDB Connected ✅"));
}

// ROUTE 1: AI UPLOAD
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File missing" });

    const AI_URL = process.env.AI_SERVICE_URL; 
    if (!AI_URL) return res.status(500).json({ error: "AI_SERVICE_URL not set in Render" });

    const formData = new FormData();
    formData.append("resume", fs.createReadStream(req.file.path));

    const response = await axios.post(AI_URL, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 60000
    });

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.json(response.data);

  } catch (err) {
    res.status(500).json({ error: "AI Processing Failed", details: err.message });
  }
});

// ROUTE 2: AUTH
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.json({ message: "Registered ✅" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    res.json({ message: "Login Successful", user: { email: user.email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server: ${PORT} 🚀`));