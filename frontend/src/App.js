import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

// --- REGISTER PAGE ---
const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    const apiBaseUrl = process.env.REACT_APP_API_URL || "https://smarthirring-backend.onrender.com";
    try {
      const res = await fetch(`${apiBaseUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) alert("Registration Successful! Now Login.");
      else alert(data.message || "Error");
    } catch (err) { alert("Backend not responding!"); }
  };

  return (
    <div className="App-header">
      <h2>Register</h2>
      <form onSubmit={handleRegister} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        <input type="email" placeholder="Apna Email Daalein" style={{padding: '10px'}} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password Banayein" style={{padding: '10px'}} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" style={{padding: '10px', cursor: 'pointer'}}>Create Account</button>
      </form>
      <Link to="/login" style={{color: 'white', marginTop: '15px'}}>Already have account? Login</Link>
    </div>
  );
};

// --- LOGIN PAGE ---
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const apiBaseUrl = process.env.REACT_APP_API_URL || "https://smarthirring-backend.onrender.com";
    try {
      const res = await fetch(`${apiBaseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) alert("Login Successful! ✅ Welcome " + data.user.email);
      else alert(data.message || "Login Failed");
    } catch (err) { alert("Backend not responding!"); }
  };

  return (
    <div className="App-header">
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        <input type="email" placeholder="Email" style={{padding: '10px'}} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" style={{padding: '10px'}} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" style={{padding: '10px', cursor: 'pointer'}}>Login</button>
      </form>
      <Link to="/register" style={{color: 'white', marginTop: '15px'}}>New user? Register Here</Link>
    </div>
  );
};

// --- UPLOAD PAGE ---
function UploadPage() {
  const [file, setFile] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    const formData = new FormData();
    formData.append("resume", file);
    setLoading(true);

    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL || "https://smarthirring-backend.onrender.com";
      // YAHAN FIX KIYA HAI: /upload use kiya hai
      const response = await fetch(`${apiBaseUrl}/upload`, {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      if (response.ok) setAiData(data);
      else alert(data.error || "AI error occurred");
    } catch (err) {
      alert("Error in AI processing ❌ Check Backend Logs");
    } finally { setLoading(false); }
  };

  return (
    <header className="App-header">
      <nav style={{marginBottom: '20px'}}>
        <Link to="/login" style={{marginRight: '20px', color: 'cyan'}}>Login</Link>
        <Link to="/register" style={{color: 'cyan'}}>Register</Link>
      </nav>
      <h1>Resume Upload & AI Analysis</h1>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} style={{marginTop: '10px', padding: '10px 20px'}}>Analyze Resume</button>
      
      {loading && <p>Processing... Please wait 1 minute.</p>}
      
      {aiData && (
        <div style={{ marginTop: "20px", textAlign: "left", background: '#333', padding: '15px' }}>
          <h3>Score: {aiData.score} / 100</h3>
          <p><strong>Skills:</strong> {aiData.skills?.join(", ")}</p>
          <p><strong>Suggestions:</strong> {aiData.suggestions?.join(". ")}</p>
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