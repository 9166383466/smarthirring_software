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
    .then(() => console.log("MongoDB Connected ✅"))
    .catch(err => console.log("DB Connection Error: ❌", err));

app.get("/", (req, res) => {
  res.send("Smart Hiring Backend is Live and Running! 🚀");
});

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
        }

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.json(aiResult);
    } catch (err) {
        res.status(500).json({ error: "AI Processing Failed" });
    }
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  res.json({ message: "Success ✅" });
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on Port: ${PORT} 🚀`));