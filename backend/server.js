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

// 1. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 2. MULTER SETUP
const upload = multer({ dest: "uploads/" });

// 3. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully ✅"))
    .catch(err => console.log("Database Connection Error: ❌", err));

// 4. ROUTES

// --- HEALTH CHECK ROUTE (Fixes "Cannot GET /") ---
app.get("/", (req, res) => {
    res.send("Smart Hiring Backend is Live and Smarter! 🚀");
});

// --- ROUTE: AI RESUME UPLOAD ---
app.post("/upload", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File not found" });

        const formData = new FormData();
        formData.append("resume", fs.createReadStream(req.file.path));

        // AI Service (Python) Request
        const response = await axios.post(process.env.AI_SERVICE_URL, formData, {
            headers: { ...formData.getHeaders() },
            timeout: 90000 // 1.5 minutes
        });

        const aiResult = response.data;

        // History Saving Logic
        if (req.body.email) {
            await User.findOneAndUpdate(
                { email: req.body.email },
                { 
                  $push: { 
                    history: { 
                      score: aiResult.score,
                      skills: aiResult.skills,
                      explanation: aiResult.explanation,
                      recommendations: aiResult.recommendations,
                      date: new Date() 
                    } 
                  } 
                }
            );
            console.log(`Log updated for user: ${req.body.email}`);
        }

        // Clean up: local file delete
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.json(aiResult);
    } catch (err) {
        console.error("Upload Error:", err.message);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: "AI Processing Service Unreachable" });
    }
});

// --- ROUTE: REGISTER ---
app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.json({ message: "Registration Successful ✅" });
    } catch (e) { 
        res.status(400).json({ error: "Email already exists" }); 
    }
});

// --- ROUTE: LOGIN ---
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (user && await bcrypt.compare(password, user.password)) {
            res.json({ 
                user: { 
                    email: user.email, 
                    history: user.history 
                } 
            });
        } else {
            res.status(400).json({ message: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 5. START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Production Server Live on Port ${PORT} 🚀`));