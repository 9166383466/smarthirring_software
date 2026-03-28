import React, { useState } from "react";
import "./App.css";

function App() {
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
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      setAiData(data);
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Error in AI processing ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Resume Upload & AI Analysis</h1>

        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload Resume</button>

        {loading && <p>Processing Resume...</p>}

        {aiData && (
          <div style={{ marginTop: "20px" }}>
            <h2>Skills Found:</h2>
            <ul>{aiData.skills.map((skill, idx) => <li key={idx}>{skill}</li>)}</ul>

            <h2>Score:</h2>
            <p>{aiData.score}</p>

            <h2>Suggestions:</h2>
            <ul>{aiData.suggestions.map((s, idx) => <li key={idx}>{s}</li>)}</ul>

            <h2>Recommended Jobs:</h2>
            <ul>{aiData.recommended_jobs.map((job, idx) => <li key={idx}>{job}</li>)}</ul>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;