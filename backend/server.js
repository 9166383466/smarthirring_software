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

const upload = multer({ dest: "uploads/" });

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully ✅"))
    .catch(err => console.log("Database Connection Error: ❌", err));

app.post("/upload", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File not found" });

        const formData = new FormData();
        formData.append("resume", fs.createReadStream(req.file.path));

        const response = await axios.post(process.env.AI_SERVICE_URL, formData, {
            headers: { ...formData.getHeaders() },
            timeout: 90000
        });

        const aiResult = response.data;

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

        fs.unlinkSync(req.file.path);
        res.json(aiResult);
    } catch (err) {
        res.status(500).json({ error: "AI Processing Service Unreachable" });
    }
});

app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.json({ message: "Registration Successful ✅" });
    } catch (e) { res.status(400).json({ error: "Email already exists" }); }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
        res.json({ user: { email: user.email, history: user.history } });
    } else {
        res.status(400).json({ message: "Invalid credentials" });
    }
});

app.listen(10000, () => console.log("Production Server Live on Port 10000 🚀"));