import React, { useState } from "react";
import { 
  ShieldCheck, Zap, FileText, BarChart3, 
  ArrowRight, Github, Twitter, Linkedin, Mail, CheckCircle2, AlertCircle
} from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null); 
  const [showLogin, setShowLogin] = useState(false); 
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
          setShowLogin(false);
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
      <div className="min-h-screen bg-[#0F172A] text-white flex flex-col font-sans">
        {/* Navbar */}
        <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-blue-500" size={32} />
            <span className="text-2xl font-black tracking-tighter">SMART-HIRE.AI</span>
          </div>
          <button onClick={() => setShowLogin(true)} className="bg-blue-600 hover:bg-blue-500 px-8 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-blue-900/40">Login</button>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
          <div className="max-w-5xl bg-slate-800/30 border border-slate-700/50 p-16 rounded-[4rem] backdrop-blur-2xl shadow-2xl relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/20 blur-[80px] rounded-full"></div>
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
              Precision <span className="text-blue-500 text-glow">Hiring</span> <br /> Starts Here.
            </h1>
            <p className="text-slate-400 text-xl md:text-2xl mb-12 max-w-3xl mx-auto font-medium">
              Smart-Hire AI uses deep neural parsing to verify your resume against global industry standards. We don't just give a score; we give you a roadmap to success.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={() => setShowLogin(true)} className="group bg-blue-600 px-12 py-5 rounded-2xl font-black text-xl hover:bg-blue-500 transition-all flex items-center gap-3 shadow-2xl">
                Get Started Free <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </main>

        {/* Login Modal */}
        {showLogin && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-[#1E293B] p-12 rounded-[3rem] w-full max-w-md border border-slate-700 shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-white">{isRegistering ? "Join Us" : "Welcome Back"}</h2>
                  <p className="text-slate-500 text-sm mt-1">Smart-Hire Secure Authentication</p>
                </div>
                <button onClick={() => setShowLogin(false)} className="text-slate-500 hover:text-white text-2xl">×</button>
              </div>
              <form onSubmit={handleAuth} className="space-y-5">
                <input className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-white" type="email" placeholder="Email Address" onChange={(e)=>setEmail(e.target.value)} required />
                <input className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-white" type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} required />
                <button className="w-full bg-blue-600 py-4 rounded-2xl font-black text-lg hover:bg-blue-500 shadow-lg shadow-blue-900/30 transition-all">
                  {isRegistering ? "Create Founder Account" : "Access Dashboard"}
                </button>
              </form>
              <p onClick={() => setIsRegistering(!isRegistering)} className="mt-8 text-center text-blue-400 cursor-pointer font-bold hover:underline">
                {isRegistering ? "Back to Login" : "New user? Register Account"}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-slate-950 border-t border-slate-900 py-16 px-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
            <div>
              <h4 className="text-2xl font-black text-blue-500 mb-6">SMART-HIRE.AI</h4>
              <p className="text-slate-500 leading-relaxed italic">"Transforming how resumes are perceived by AI-driven corporations."</p>
            </div>
            <div className="space-y-4">
              <h5 className="font-black uppercase text-xs tracking-widest text-slate-400">Project Info</h5>
              <p className="text-slate-500 text-sm">Built with React, Node.js, and Python AI. Database managed by MongoDB Atlas.</p>
            </div>
            <div className="space-y-6">
              <h5 className="font-black uppercase text-xs tracking-widest text-slate-400">Developer Connect</h5>
              <div className="flex gap-6">
                <Github className="text-slate-500 hover:text-white transition-colors cursor-pointer" />
                <Linkedin className="text-slate-500 hover:text-white transition-colors cursor-pointer" />
                <Twitter className="text-slate-500 hover:text-white transition-colors cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="text-center mt-16 pt-8 border-t border-slate-900 text-slate-700 font-bold text-xs">
            DEVELOPED BY RINKU MEENA | VERSION 2.0.4
          </div>
        </footer>
      </div>
    );
  }

  // --- DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col font-sans">
      <nav className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 sticky top-0 z-20 backdrop-blur-md">
        <h1 className="text-xl font-black text-blue-500 italic tracking-tighter">SMART-HIRE DASHBOARD</h1>
        <div className="flex items-center gap-6">
          <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">{user.email}</span>
          <button onClick={()=>setUser(null)} className="text-red-500 font-black hover:text-red-400 text-xs">LOGOUT</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-10 w-full space-y-10">
        {/* Scan Section */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-16 rounded-[3.5rem] border border-slate-700 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px]"></div>
          <h2 className="text-5xl font-black mb-4">Neural Scan Engine</h2>
          <p className="text-slate-400 text-lg mb-12">Drop your PDF resume below for a comprehensive AI analysis.</p>
          <div className="flex flex-col items-center gap-8">
            <input type="file" onChange={(e)=>setFile(e.target.files[0])} className="text-slate-400 file:bg-blue-600 file:text-white file:px-8 file:py-3 file:rounded-xl file:border-0 file:font-black cursor-pointer" />
            <button onClick={handleUpload} disabled={loading} className="bg-white text-black px-16 py-5 rounded-2xl font-black text-xl hover:bg-blue-500 hover:text-white transition-all shadow-xl shadow-blue-900/20 active:scale-95">
              {loading ? "AI ENGINES RUNNING..." : "INITIALIZE SCAN"}
            </button>
          </div>
        </div>

        {/* Results with Explanation */}
        {aiData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-600 p-10 rounded-[2.5rem] flex flex-col items-center justify-center shadow-2xl shadow-blue-900/40">
                <span className="text-blue-100 text-xs font-black uppercase tracking-widest mb-2">ATS Score</span>
                <div className="text-7xl font-black">{aiData.score}%</div>
              </div>
              <div className="md:col-span-2 bg-slate-800 border border-slate-700 p-10 rounded-[2.5rem] flex flex-col">
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest mb-6">Keywords Detected</span>
                <div className="flex flex-wrap gap-3">
                  {aiData.skills?.map((s, i) => <span key={i} className="bg-slate-700/50 px-5 py-2 rounded-xl text-sm font-bold text-blue-400 border border-blue-500/20">{s}</span>)}
                </div>
              </div>
            </div>

            {/* Score Logic Explanation */}
            <div className="bg-[#1E293B] border border-slate-700 p-10 rounded-[2.5rem]">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <BarChart3 className="text-blue-500" /> Why this score? (Analysis Logic)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-white">Keyword Matching (40%)</h4>
                    <p className="text-slate-500 text-sm">Our AI matched the skills in your resume with trending industry job descriptions.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-white">Formatting Check (30%)</h4>
                    <p className="text-slate-500 text-sm">Checked for machine-readable layouts that typical ATS systems can parse easily.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <AlertCircle className="text-blue-500 shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-white">Experience Density (20%)</h4>
                    <p className="text-slate-500 text-sm">Calculated based on the quantity and relevance of professional keywords found.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Zap className="text-yellow-500 shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-white">Neural Relevance (10%)</h4>
                    <p className="text-slate-500 text-sm">Smart-Hire's proprietary algorithm for predicting hireability.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extended History Table */}
        <div className="bg-slate-800 rounded-[3rem] border border-slate-700 overflow-hidden shadow-2xl">
          <div className="p-8 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center px-12">
            <h3 className="font-black text-lg tracking-tight flex items-center gap-3">
              <History className="text-blue-500" size={20} /> FULL ANALYSIS LOGS
            </h3>
            <span className="text-[10px] bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full font-black">DATABASE ACTIVE</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/80 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                  <th className="p-8 px-12">Scan Date</th>
                  <th className="p-8">Match Quality</th>
                  <th className="p-8">Extracted Core Skills</th>
                  <th className="p-8 text-right px-12">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {user.history && user.history.length > 0 ? user.history.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-700/20 transition-all group">
                    <td className="p-8 px-12 text-sm text-slate-400 font-medium">
                      {new Date(h.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${h.score}%` }}></div>
                        </div>
                        <span className="font-black text-blue-400">{h.score}%</span>
                      </div>
                    </td>
                    <td className="p-8 text-xs text-slate-500 font-bold uppercase tracking-wider italic">
                      {h.skills?.slice(0, 4).join(" • ")}
                    </td>
                    <td className="p-8 text-right px-12">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg font-black border border-emerald-500/20 uppercase">Verified</span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="p-20 text-center text-slate-500 italic text-lg tracking-tight">No historical data found. Your first scan will initialize the log.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;