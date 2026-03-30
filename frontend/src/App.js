

import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    
    const formData = new FormData();
    formData.append("resume", file); // Python expects 'resume' key
    setLoading(true);

    try {
      // 1. Python URL (Direct Python link bina kisi backend ke)
      const apiBaseUrl = process.env.REACT_APP_API_URL || "https://smarthirring-ai.onrender.com";
      
      // 2. Python route '/analyze' hai, isey change mat karna
      const cleanUrl = `${apiBaseUrl.replace(/\/$/, "")}/analyze`;
      
      const response = await fetch(cleanUrl, {
        method: "POST",
        body: formData, // No headers needed for FormData
      });

      const data = await response.json();

      if (response.ok) {
        setAiData(data);
        alert("Success! AI ne resume dekh liya. ✅");
      } else {
        alert("AI Error: " + (data.error || "Kuch galat hua"));
      }
    } catch (err) {
      alert("Network Error: Python server se connect nahi ho pa raha! ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Resume AI Analyzer</h1>
        <div style={{ padding: "20px", border: "1px solid #555", borderRadius: "10px" }}>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <br /><br />
          <button onClick={handleUpload} disabled={loading} style={{ padding: "10px 20px" }}>
            {loading ? "AI is Analyzing..." : "Analyze Now"}
          </button>
        </div>

        {aiData && (
          <div style={{ marginTop: "30px", textAlign: "left", background: "#222", padding: "20px" }}>
            <h2>Results:</h2>
            <p><strong>ATS Score:</strong> {aiData.score}</p>
            <p><strong>Skills Found:</strong> {aiData.skills?.join(", ")}</p>
            <p><strong>Jobs for You:</strong> {aiData.recommended_jobs?.join(", ")}</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;