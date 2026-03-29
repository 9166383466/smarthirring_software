require('dotenv').config(); // 👈 SABSE ZAROORI: Ye line variables read karne ke liye hai
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

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= UPLOADS FOLDER CHECK =================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// ================= MULTER SETUP =================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });
console.log("All Env Vars:", process.env);
// ================= MONGODB CONNECTION =================
const mongoURI = process.env.MONGO_URI; 

console.log("Checking Database Connection...");

if (!mongoURI) {
    console.error("ERROR: MONGO_URI is not defined! Make sure Env Group is linked. ❌");
} else {
    mongoose.connect(mongoURI)
      .then(() => console.log("MongoDB Connected Successfully! ✅"))
      .catch(err => console.error("MongoDB Connection Error: ", err.message));
}

// ================= ROUTES =================

app.get("/", (req, res) => {
  res.send("Smart Hiring Backend is running 🚀");
});

// UPLOAD & AI ANALYSIS
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded ❌" });

    const formData = new FormData();
    formData.append("resume", fs.createReadStream(req.file.path));

    // 'AI_SERVICE_URL' link from Render Env Group
    const AI_URL = process.env.AI_SERVICE_URL;

    if (!AI_URL) {
        return res.status(500).json({ error: "AI Service URL not configured in Backend ❌" });
    }

    console.log(`Sending file to AI at: ${AI_URL}`);

    const response = await axios.post(AI_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 60000 // 60 seconds (AI takes time to process PDF)
    });

    // File delete after processing
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    
    res.json(response.data);

  } catch (err) {
    console.error("AI Error Details:", err.response?.data || err.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Error in AI processing ❌", details: err.message });
  }
});

// LOGIN & REGISTER
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.json({ message: "User Registered ✅" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });
    res.json({ message: "Login Successful ✅", user: { email: user.email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================= SERVER =================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT} 🚀`);
});