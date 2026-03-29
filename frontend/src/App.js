import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

// --- Components (Aap inke liye alag files bhi bana sakte hain) ---
const LoginPage = () => <div className="App-header"><h2>Login Page (Work in Progress)</h2><Link to="/" style={{color: 'white'}}>Go to Upload</Link></div>;
const RegisterPage = () => <div className="App-header"><h2>Register Page (Work in Progress)</h2><Link to="/" style={{color: 'white'}}>Go to Upload</Link></div>;

function UploadPage() {
  const [file, setFile] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    try {
      // Yahan hum Environment Variable use kar rahe hain jo Vercel mein dala tha
      const apiBaseUrl = process.env.REACT_APP_API_URL || "https://smarthirring-backend.onrender.com";
      
      const response = await fetch(`${apiBaseUrl}/analyze`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Backend response error");

      const data = await response.json();
      setAiData(data);
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Error in AI processing ❌ Check Backend Logs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="App-header">
      <nav style={{marginBottom: '20px'}}>
        <Link to="/login" style={{marginRight: '10px', color: 'white'}}>Login</Link>
        <Link to="/register" style={{color: 'white'}}>Register</Link>
      </nav>
      <h1>Resume Upload & AI Analysis</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Resume</button>
      {loading && <p>Processing Resume...</p>}
      {aiData && (
        <div style={{ marginTop: "20px", textAlign: "left" }}>
          <h2>Skills Found:</h2>
          <ul>{aiData.skills?.map((skill, idx) => <li key={idx}>{skill}</li>)}</ul>
          <h2>Score: {aiData.score}</h2>
          <h2>Suggestions:</h2>
          <ul>{aiData.suggestions?.map((s, idx) => <li key={idx}>{s}</li>)}</ul>
          <h2>Recommended Jobs:</h2>
          <ul>{aiData.recommended_jobs?.map((job, idx) => <li key={idx}>{job}</li>)}</ul>
        </div>
      )}
    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;