import React, { useState } from "react";
import { 
  ShieldCheck, Zap, BarChart3, ArrowRight, Github, Twitter, Linkedin, 
  CheckCircle2, AlertCircle, History, LogOut, Search, Cpu 
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
        if (!isRegistering) { setUser(data.user); setShowLogin(false); }
        else { setIsRegistering(false); alert("Success! Please Login."); }
      } else { alert(data.error || data.message); }
    } catch (err) { alert("Backend unreachable!"); }
  };

  const handleUpload = async () => {
    if (!file) return alert("Select file!");
    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("email", user.email);
    try {
      const res = await fetch(`${API_URL}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setAiData(data);
        setUser(prev => ({
          ...prev,
          history: [{ ...data, date: new Date() }, ...(prev.history || [])]
        }));
      }
    } catch (err) { alert("AI Scanning Failed!"); }
    finally { setLoading(false); }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex flex-col font-sans">
        <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto w-full sticky top-0 bg-[#0F172A]/90 backdrop-blur-md z-50">
          <div className="flex items-center gap-3"><ShieldCheck className="text-blue-500" size={32} /><span className="text-2xl font-black italic">SMART-HIRE.AI</span></div>
          <button onClick={() => setShowLogin(true)} className="bg-blue-600 px-8 py-2 rounded-full font-bold">LOGIN</button>
        </nav>

        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
          <div className="max-w-5xl bg-slate-800/20 border border-slate-700 p-20 rounded-[4rem] backdrop-blur-3xl shadow-2xl relative">
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tighter">Your Future <span className="text-blue-500 italic">Starts</span> With AI.</h1>
            <p className="text-slate-400 text-xl md:text-2xl mb-12 max-w-3xl mx-auto">Analyze, Optimize, and Verify your resume against corporate ATS standards using neural parsing.</p>
            <button onClick={() => setShowLogin(true)} className="bg-white text-black px-12 py-5 rounded-2xl font-black text-xl flex items-center gap-4 mx-auto shadow-2xl hover:bg-blue-600 hover:text-white transition-all">GET STARTED <ArrowRight /></button>
          </div>
        </section>

        {showLogin && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-[#1E293B] p-12 rounded-[3.5rem] w-full max-w-md border border-slate-700 shadow-2xl relative animate-in zoom-in duration-300">
              <button onClick={() => setShowLogin(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white">CLOSE</button>
              <h2 className="text-4xl font-black text-white leading-tight">{isRegistering ? "Join" : "Welcome"}</h2>
              <form onSubmit={handleAuth} className="space-y-6 mt-6">
                <input className="w-full p-4 rounded-2xl bg-[#0F172A] border border-slate-700 outline-none" type="email" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} required />
                <input className="w-full p-4 rounded-2xl bg-[#0F172A] border border-slate-700 outline-none" type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} required />
                <button className="w-full bg-blue-600 py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/40">{isRegistering ? "CREATE ACCOUNT" : "ACCESS DASHBOARD"}</button>
              </form>
              <p onClick={() => setIsRegistering(!isRegistering)} className="mt-8 text-center text-blue-400 cursor-pointer font-bold uppercase tracking-widest text-xs">{isRegistering ? "Back to Login" : "New Founder? Register"}</p>
            </div>
          </div>
        )}

        <footer className="p-20 bg-slate-950 border-t border-slate-900">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex flex-col gap-2"><h3 className="text-2xl font-black text-blue-500">HIRE.AI</h3><p className="text-slate-600 text-sm">Empowering talent with neural insights. Built by Rinku Meena | 2026</p></div>
                <div className="flex gap-8 text-slate-700"><Github className="hover:text-white" /><Linkedin className="hover:text-white" /><Twitter className="hover:text-white" /></div>
            </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col font-sans">
      <nav className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 sticky top-0 z-20 backdrop-blur-md px-10">
        <h1 className="text-lg font-black tracking-tighter text-blue-500 uppercase italic">System.Console</h1>
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{user.email}</span>
          <button onClick={()=>setUser(null)} className="text-red-500 font-black text-xs">LOGOUT</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-10 w-full space-y-12 pb-32">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-16 rounded-[4rem] border border-slate-700 shadow-2xl text-center relative overflow-hidden group">
          <h2 className="text-5xl font-black mb-4 tracking-tighter uppercase italic">Initialize Scan</h2>
          <p className="text-slate-400 text-lg mb-12">Submit your document for neural skill and project extraction.</p>
          <div className="flex flex-col items-center gap-10">
            <input type="file" onChange={(e)=>setFile(e.target.files[0])} className="text-sm text-slate-500 file:bg-blue-600 file:text-white file:px-10 file:py-4 file:rounded-2xl file:border-0 file:font-black file:cursor-pointer" />
            <button onClick={handleUpload} disabled={loading} className="bg-white text-black px-20 py-6 rounded-[2rem] font-black text-xl hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95">
              {loading ? "SCANNING DATA..." : "RUN AI ANALYSIS"}
            </button>
          </div>
        </div>

        {aiData && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-blue-600 p-12 rounded-[3.5rem] flex flex-col items-center justify-center shadow-2xl shadow-blue-900/50">
                <span className="text-blue-100 text-[10px] font-black uppercase tracking-[0.3em] mb-3 italic text-center">ATS Match Quality</span>
                <div className="text-8xl font-black italic">{aiData.score}%</div>
              </div>
              <div className="md:col-span-2 bg-slate-800 border border-slate-700 p-12 rounded-[3.5rem] shadow-xl">
                <h4 className="text-blue-400 font-black text-xs uppercase mb-6 tracking-widest flex items-center gap-2"><AlertCircle size={16}/> AI Expert Analysis:</h4>
                <p className="text-xl text-white font-medium mb-10 italic leading-relaxed">"{aiData.explanation}"</p>
                <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-700">
                    <span className="text-emerald-500 font-black text-[10px] uppercase block mb-6 tracking-widest">Recommended Roadmap:</span>
                    <ul className="space-y-4">
                        {aiData.recommendations?.map((r, i) => (
                          <li key={i} className="flex gap-4 text-sm text-slate-300 font-bold">
                            <Zap className="text-yellow-500" size={18}/> {r}
                          </li>
                        ))}
                    </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-800 rounded-[3.5rem] border border-slate-700 overflow-hidden shadow-2xl">
          <div className="p-8 bg-slate-900/50 border-b border-slate-700 font-black text-xl tracking-tight flex items-center gap-4 uppercase italic"><History className="text-blue-500" /> Historical Logs</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-slate-500 text-[10px] uppercase font-black tracking-[0.3em]"><th className="p-10 px-14">Scan Date</th><th className="p-10 text-center">Score Profile</th><th className="p-10 px-14 text-right">Extracted Skills</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {user.history?.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-700/20 transition-all">
                    <td className="p-10 px-14 text-sm text-slate-400 font-bold">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="p-10 text-center font-black text-blue-400 text-xl">{h.score}%</td>
                    <td className="p-10 px-14 text-right text-[11px] text-slate-500 font-black uppercase italic tracking-tighter">{h.skills?.slice(0, 3).join(" • ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;