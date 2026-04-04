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

// --- FIXED CORS ---
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// Multer Setup
if (!fs.existsSync("uploads/")) {
    fs.mkdirSync("uploads/");
}
const upload = multer({ dest: "uploads/" });

// DB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully ✅"))
    .catch(err => console.error("DB Connection Error: ❌", err));

app.get("/", (req, res) => {
  res.send("Smart Hiring Backend is Live! 🚀");
});

// --- Auth Routes (FIXED) ---

// 1. REGISTER
app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ 
            email: email.toLowerCase(), 
            password: hashedPassword 
        });
        
        await user.save();
        console.log(`New User Registered: ${email}`);
        res.json({ message: "Success ✅" });
    } catch (e) {
        console.error("Registration Error:", e);
        res.status(500).json({ message: "Registration failed" });
    }
});

// 2. LOGIN (WITH DEBUG LOGS)
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("--- Login Attempt ---");
        console.log("Email:", email);

        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            console.log("Result: User not found in database.");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password Match:", isMatch);

        if (isMatch) {
            console.log("Result: Login Successful!");
            res.json({ user: { email: user.email, history: user.history } });
        } else {
            console.log("Result: Password Mismatch.");
            res.status(400).json({ message: "Invalid credentials" });
        }
    } catch (e) {
        console.error("Login Error:", e);
        res.status(500).json({ message: "Login failed" });
    }
});

// --- Resume Upload & AI Analysis ---
app.post("/upload", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File missing" });

        const formData = new FormData();
        formData.append("resume", fs.createReadStream(req.file.path));

        const response = await axios.post(process.env.AI_SERVICE_URL, formData, {
            headers: { ...formData.getHeaders() },
            timeout: 90000
        });

        const aiResult = response.data;

        if (req.body.email) {
            await User.findOneAndUpdate(
                { email: req.body.email.toLowerCase() },
                { 
                  $push: { 
                    history: { 
                      score: aiResult.score || 0,
                      skills: aiResult.skills || [],
                      date: new Date() 
                    } 
                  } 
                }
            );
        }

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.json(aiResult);
    } catch (err) {
        console.error("AI Error:", err.message);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: "AI Processing Failed" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on Port: ${PORT} 🚀`));