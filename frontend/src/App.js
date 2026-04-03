import React, { useState } from "react";
import { 
  ShieldCheck, Zap, FileText, BarChart3, 
  ArrowRight, Github, Twitter, Linkedin, Mail, 
  CheckCircle2, AlertCircle, Upload, LayoutDashboard, History, Search, Cpu
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
          alert("Success! Please Login.");
          setIsRegistering(false);
        }
      } else { alert(data.error || data.message); }
    } catch (err) { alert("Backend unreachable!"); }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file!");
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
    } catch (err) { alert("AI Analysis Failed!"); }
    finally { setLoading(false); }
  };

  // --- LANDING PAGE ---
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex flex-col font-sans">
        {/* Navbar */}
        <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto w-full sticky top-0 bg-[#0F172A]/90 backdrop-blur-md z-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/40"><ShieldCheck size={28} /></div>
            <span className="text-2xl font-black tracking-tighter italic">SMART-HIRE.AI</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <a href="#about" className="hover:text-blue-500 transition-colors">About AI</a>
            <a href="#features" className="hover:text-blue-500 transition-colors">Features</a>
          </div>
          <button onClick={() => setShowLogin(true)} className="bg-blue-600 hover:bg-blue-500 px-8 py-2.5 rounded-full font-black transition-all shadow-xl shadow-blue-900/20 active:scale-95">START SCAN</button>
        </nav>

        {/* HERO SECTION */}
        <section className="flex flex-col items-center justify-center text-center px-6 py-32 relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full -z-10"></div>
          <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none tracking-tighter">
              Verify Your Resume <br /><span className="text-blue-500">With Neural Power.</span>
            </h1>
            <p className="text-slate-400 text-xl md:text-2xl mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Smart-Hire AI uses state-of-the-art NLP models to simulate how fortune 500 companies scan your profile. Don't leave your career to chance.
            </p>
            <button onClick={() => setShowLogin(true)} className="group bg-white text-black px-12 py-5 rounded-2xl font-black text-xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-4 mx-auto shadow-2xl">
              ANALYZE FOR FREE <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </section>

        {/* ABOUT SECTION (Smart-Hire ke bare mein text) */}
        <section id="about" className="max-w-7xl mx-auto px-6 py-24 w-full border-t border-slate-800/50">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl font-black mb-6 text-white leading-tight">What is <span className="text-blue-500">Smart-Hire AI?</span></h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6">
                Smart-Hire AI is an advanced career-tech platform designed to bridge the gap between candidates and Automated Tracking Systems (ATS). Most modern companies use AI to filter out 75% of resumes before a human even sees them.
              </p>
              <p className="text-slate-400 text-lg leading-relaxed">
                Our mission is to empower developers and founders by providing a deep-learning analysis of their professional documents, ensuring they hit the 90th percentile in keyword matching and formatting accuracy.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
                  <Cpu className="text-blue-500 mb-4" size={32} />
                  <h4 className="font-bold mb-2">Neural Engine</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Deep-learning model for skill extraction.</p>
               </div>
               <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 mt-8">
                  <Search className="text-blue-500 mb-4" size={32} />
                  <h4 className="font-bold mb-2">ATS Simulation</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Mimics corporate HR software filters.</p>
               </div>
            </div>
          </div>
        </section>

        {/* FEATURES (Pro logic of website) */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24 w-full">
           <div className="text-center mb-16">
              <span className="text-blue-500 font-black text-xs tracking-widest uppercase mb-4 block">Our Capability</span>
              <h3 className="text-4xl font-black">Why use Smart-Hire?</h3>
           </div>
           <div className="grid md:grid-cols-3 gap-8">
              {[
                { t: "Instant Scoring", d: "Get a score from 0-100 based on your ATS readability and keyword density.", i: <Zap /> },
                { t: "Skill Extraction", d: "AI automatically identifies and categorizes your tech stack and soft skills.", i: <BarChart3 /> },
                { t: "Actionable Roadmap", d: "Personalized suggestions on what to improve to increase hireability.", i: <CheckCircle2 /> }
              ].map((f, i) => (
                <div key={i} className="bg-[#1E293B] p-10 rounded-[2.5rem] border border-slate-800 hover:border-blue-500 transition-all group">
                   <div className="bg-blue-600/10 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">{f.i}</div>
                   <h4 className="text-xl font-bold mb-4">{f.t}</h4>
                   <p className="text-slate-500 text-sm leading-relaxed">{f.d}</p>
                </div>
              ))}
           </div>
        </section>

        {/* LOGIN MODAL */}
        {showLogin && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-[#1E293B] p-12 rounded-[3.5rem] w-full max-w-md border border-slate-700 shadow-2xl relative animate-in zoom-in duration-300">
              <button onClick={() => setShowLogin(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white font-bold">CLOSE</button>
              <h2 className="text-4xl font-black text-white mb-2">{isRegistering ? "Join" : "Login"}</h2>
              <p className="text-slate-500 text-sm mb-10 tracking-widest font-bold uppercase">Smart-Hire Secure Portal</p>
              <form onSubmit={handleAuth} className="space-y-6">
                <input className="w-full p-5 rounded-2xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-white outline-none" type="email" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} required />
                <input className="w-full p-5 rounded-2xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-white outline-none" type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} required />
                <button className="w-full bg-blue-600 py-5 rounded-2xl font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40">
                  {isRegistering ? "CREATE ACCOUNT" : "ENTER SYSTEM"}
                </button>
              </form>
              <p onClick={() => setIsRegistering(!isRegistering)} className="mt-8 text-center text-blue-400 cursor-pointer font-black text-xs uppercase tracking-[0.2em]">{isRegistering ? "Back to Login" : "New User? Register"}</p>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="bg-[#020617] border-t border-slate-900 py-20 px-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
             <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center gap-2 mb-4 font-black text-2xl italic tracking-tighter">SMART-HIRE.AI</div>
                <p className="text-slate-600 text-sm text-center md:text-left max-w-sm">
                  Revolutionizing recruitment through artificial intelligence. Empowering candidates since 2026.
                </p>
             </div>
             <div className="flex gap-10">
                <Github className="text-slate-700 hover:text-white cursor-pointer" />
                <Linkedin className="text-slate-700 hover:text-white cursor-pointer" />
                <Twitter className="text-slate-700 hover:text-white cursor-pointer" />
             </div>
          </div>
          <div className="text-center mt-20 text-[10px] text-slate-800 font-black tracking-[1em] uppercase">Built by Rinku Meena | Full-Stack Developer</div>
        </footer>
      </div>
    );
  }

  // --- DASHBOARD (Login ke baad wahi pro code jo upar diya tha) ---
  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col font-sans">
      <nav className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 sticky top-0 z-20 backdrop-blur-md px-10">
        <h1 className="text-lg font-black tracking-tighter text-blue-500">SYSTEM.CONSOLE</h1>
        <div className="flex items-center gap-6">
          <span className="text-xs font-bold text-slate-500">{user.email}</span>
          <button onClick={()=>setUser(null)} className="text-red-500 font-black text-xs tracking-widest">LOGOUT</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-10 w-full space-y-12 pb-32">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-16 rounded-[4rem] border border-slate-700 shadow-2xl text-center relative overflow-hidden group">
          <h2 className="text-5xl font-black mb-4">Initial Scan Phase</h2>
          <p className="text-slate-400 text-lg mb-12">Submit your document for neural skill extraction.</p>
          <div className="flex flex-col items-center gap-10">
            <input type="file" onChange={(e)=>setFile(e.target.files[0])} className="text-sm text-slate-500 file:bg-blue-600 file:text-white file:px-10 file:py-4 file:rounded-2xl file:border-0 file:font-black file:cursor-pointer" />
            <button onClick={handleUpload} disabled={loading} className="bg-white text-black px-20 py-6 rounded-[2rem] font-black text-xl hover:bg-blue-600 hover:text-white transition-all shadow-2xl">
              {loading ? "SCANNING DATA..." : "EXECUTE AI ANALYSIS"}
            </button>
          </div>
        </div>

        {aiData && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-blue-600 p-12 rounded-[3rem] flex flex-col items-center justify-center shadow-2xl shadow-blue-900/50">
                <span className="text-blue-100 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Overall Match</span>
                <div className="text-8xl font-black italic">{aiData.score}%</div>
              </div>
              <div className="md:col-span-2 bg-slate-800 border border-slate-700 p-12 rounded-[3rem] shadow-xl">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8 block">Extracted Skillset</span>
                <div className="flex flex-wrap gap-4">
                  {aiData.skills?.map((s, i) => <span key={i} className="bg-slate-700/50 px-6 py-3 rounded-2xl text-sm font-black text-blue-400 border border-blue-500/10 uppercase italic">{s}</span>)}
                </div>
              </div>
            </div>

            {/* Suggestions Roadmap */}
            <div className="bg-[#1E293B] border border-blue-500/30 p-12 rounded-[3.5rem] shadow-2xl">
              <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-white">
                <CheckCircle2 className="text-blue-500" size={32} /> AI IMPROVEMENT ROADMAP
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 text-left">
                <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-700 flex gap-6">
                  <div className="bg-blue-600/20 p-4 h-fit rounded-2xl text-blue-500"><Zap size={24}/></div>
                  <div>
                    <h4 className="font-black text-white uppercase text-xs mb-2">Content Logic</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{aiData.score < 50 ? "Your resume lacks specific keywords. We recommend using industry-standard terms to pass the initial ATS filter." : "Content strength is solid. To improve, add more 'Action Verbs' (Led, Designed, Optimized) at the start of bullet points."}</p>
                  </div>
                </div>
                <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-700 flex gap-6">
                  <div className="bg-orange-500/20 p-4 h-fit rounded-2xl text-orange-500"><AlertCircle size={24}/></div>
                  <div>
                    <h4 className="font-black text-white uppercase text-xs mb-2">Formatting Warning</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">Avoid complex layouts, tables, or icons inside the body. Neural engines prefer clean, single-column text for higher accuracy.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-800 rounded-[3.5rem] border border-slate-700 overflow-hidden shadow-2xl">
          <div className="p-8 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center px-14">
            <h3 className="font-black text-xl tracking-tight flex items-center gap-4"><History className="text-blue-500" /> HISTORICAL ANALYSIS LOGS</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/80 text-slate-500 text-[10px] uppercase font-black tracking-[0.3em]"><th className="p-10 px-14">Scan Date</th><th className="p-10">Match Profile</th><th className="p-10 px-14 text-right">Core Skills</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {user.history?.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-700/20 transition-all">
                    <td className="p-10 px-14 text-sm text-slate-400 font-bold">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="p-10">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${h.score}%` }}></div>
                        </div>
                        <span className="font-black text-blue-400">{h.score}%</span>
                      </div>
                    </td>
                    <td className="p-10 px-14 text-right text-[11px] text-slate-500 font-bold uppercase italic">{h.skills?.slice(0, 3).join(" • ")}</td>
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