require('dotenv').config();
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
app.use(cors());
app.use(express.json());

// Multer Setup (Uploads folder ensure karo ki exist karta hai)
if (!fs.existsSync("uploads/")) {
    fs.mkdirSync("uploads/");
}
const upload = multer({ dest: "uploads/" });

// DB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected ✅"))
    .catch(err => console.log("DB Connection Error: ❌", err));

app.get("/", (req, res) => {
  res.send("Smart Hiring Backend is Live! 🚀");
});

// --- Resume Upload & AI Analysis ---
app.post("/upload", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File missing" });

        const formData = new FormData();
        formData.append("resume", fs.createReadStream(req.file.path));

        // AI Service Request
        const response = await axios.post(process.env.AI_SERVICE_URL, formData, {
            headers: { ...formData.getHeaders() },
            timeout: 90000
        });

        const aiResult = response.data;

        // User History Update (Optional)
        if (req.body.email) {
            await User.findOneAndUpdate(
                { email: req.body.email },
                { 
                  $push: { 
                    history: { 
                      score: aiResult.score || 0,
                      skills: aiResult.skills || [],
                      explanation: aiResult.explanation || "",
                      recommendations: aiResult.recommendations || [],
                      date: new Date() 
                    } 
                  } 
                }
            );
        }

        // Cleanup: File delete karna zaroori hai
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        
        res.json(aiResult);
    } catch (err) {
        console.error("AI Error:", err.message);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: "AI Processing Failed or Service Offline" });
    }
});

// --- Auth Routes ---
app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.json({ message: "Success ✅" });
    } catch (e) {
        res.status(500).json({ message: "Registration failed" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            res.json({ user: { email: user.email, history: user.history } });
        } else {
            res.status(400).json({ message: "Invalid credentials" });
        }
    } catch (e) {
        res.status(500).json({ message: "Login failed" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on Port: ${PORT} 🚀`));