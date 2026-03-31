import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "https://smarthirring-backend.onrender.com";

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? "/register" : "/login";
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        if (!isRegistering) {
          setUser(data.user);
          alert("Login Success! 🚀");
        } else {
          alert("Success! Now please login.");
          setIsRegistering(false);
        }
      } else { alert(data.error || data.message); }
    } catch (err) { alert("Backend unreachable!"); }
  };

  const handleUpload = async () => {
    if (!file) return alert("Select file!");
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("email", user.email);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setAiData(data);
        // Table ko turant update karne ke liye
        setUser(prev => ({
          ...prev,
          history: [{ score: data.score, skills: data.skills, date: new Date() }, ...(prev.history || [])]
        }));
      }
    } catch (err) { alert("Network Error!"); }
    finally { setLoading(false); }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
          <h2 className="text-3xl font-bold text-white text-center mb-8">{isRegistering ? "Join Startup" : "Founder Login"}</h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <input className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 outline-none focus:border-blue-500" type="email" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} required />
            <input className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 outline-none focus:border-blue-500" type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} required />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all">{isRegistering ? "Create Account" : "Login"}</button>
          </form>
          <p onClick={()=>setIsRegistering(!isRegistering)} className="text-center text-blue-400 mt-4 cursor-pointer text-sm hover:underline">{isRegistering ? "Already a member? Login" : "New founder? Register"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <nav className="p-4 bg-slate-800 flex justify-between items-center px-10 border-b border-slate-700">
        <span className="text-xl font-black text-blue-500 tracking-tighter">SMART-HIRE.AI</span>
        <button onClick={()=>setUser(null)} className="text-sm bg-slate-700 px-4 py-1 rounded hover:bg-red-900 transition-colors">Logout</button>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-slate-800 p-10 rounded-3xl border border-slate-700 shadow-xl text-center mb-8">
            <h1 className="text-4xl font-extrabold mb-4 text-white">AI Resume Analyzer</h1>
            <input type="file" onChange={(e)=>setFile(e.target.files[0])} className="mb-6 block mx-auto text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"/>
            <button onClick={handleUpload} disabled={loading} className="bg-blue-600 px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-lg shadow-blue-900/20">
              {loading ? "AI Analyzing..." : "Run AI Check"}
            </button>
        </div>

        {aiData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-900/20 border border-blue-500/50 p-6 rounded-2xl">
              <p className="text-blue-400 text-sm font-bold uppercase">ATS Score</p>
              <h2 className="text-5xl font-black">{aiData.score}%</h2>
            </div>
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
              <p className="text-slate-400 text-sm font-bold uppercase mb-2">Skills Found</p>
              <div className="flex flex-wrap gap-2">
                {aiData.skills?.map((s, i) => <span key={i} className="bg-slate-700 px-2 py-1 rounded text-xs">{s}</span>)}
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-4 bg-slate-700/50 border-b border-slate-700 font-bold text-sm">Your Analysis History</div>
          <table className="w-full text-left">
            <thead className="bg-slate-700 text-slate-300 text-[10px] uppercase">
              <tr><th className="p-4">Date</th><th className="p-4">Score</th><th className="p-4">Skills</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {user.history && user.history.length > 0 ? user.history.map((h, i) => (
                <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4 text-xs text-slate-400">{new Date(h.date).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-blue-400">{h.score}%</td>
                  <td className="p-4 text-[11px] text-slate-500">{h.skills?.slice(0, 3).join(", ")}...</td>
                </tr>
              )) : (
                <tr><td colSpan="3" className="p-10 text-center text-slate-500 italic text-sm">No scans yet. Upload your first resume!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;