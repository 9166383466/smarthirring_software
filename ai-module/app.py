from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber  # PyPDF2 se behtar hai (Install: pip install pdfplumber)
import os

app = Flask(__name__)
CORS(app)

# --- 1. KNOWLEDGE BASE ---
job_roles = {
    "python": ["Backend Developer", "Data Scientist"],
    "java": ["Java Developer", "Enterprise Architect"],
    "react": ["Frontend Developer", "UI Engineer"],
    "javascript": ["Full Stack Developer", "Web Developer"],
    "sql": ["Database Engineer", "Data Analyst"],
    "mongodb": ["Database Administrator"],
    "nodejs": ["Backend Lead"],
    "c++": ["Systems Engineer", "Game Developer"]
}

# Score badhane ke liye extra keywords (Projects/Tools)
project_keywords = ["github", "deployed", "developed", "api", "database", "authentication", "system", "portfolio"]

def extract_text(file):
    # pdfplumber use kar rahe hain taaki formatting errors na aayein
    with pdfplumber.open(file) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'resume' not in request.files:
        return jsonify({"error": "No file uploaded ❌"}), 400

    file = request.files['resume']
    try:
        raw_text = extract_text(file).lower()
    except Exception as e:
        return jsonify({"error": f"PDF read error ❌ {str(e)}"}), 500

    # --- 2. AI SCORING LOGIC ---
    skills_list = list(job_roles.keys())
    found_skills = [s for s in skills_list if s in raw_text]
    
    # Project Detection Logic
    found_projects = [p for p in project_keywords if p in raw_text]
    
    # Calculation: Skills (60%) + Projects/Format (40%)
    base_score = len(found_skills) * 15
    project_bonus = len(found_projects) * 5
    total_score = min(base_score + project_bonus, 100)

    # --- 3. EXPLANATION & RECOMMENDATIONS ---
    explanation = ""
    recommendations = []

    if total_score < 50:
        explanation = "Aapka score low hai kyunki resume mein industry-standard keywords aur projects ki kami hai."
        recommendations = [
            "Apne projects ka 'GitHub' ya 'Live Demo' link zaroori add karein.",
            "Technical skills section mein missing keywords add karein: " + ", ".join([s for s in skills_list if s not in found_skills][:3]),
            "Experience section mein Bullet Points ka use karein."
        ]
    elif total_score < 85:
        explanation = "Good work! Aapka resume kafi had tak ATS-friendly hai, par kuch tweaks ki zaroorat hai."
        recommendations = [
            "Achievements ko Numbers (e.g., 20% faster, 50+ users) mein likhein.",
            "In tools ka zikr karein: Docker, AWS, ya Git agar aapne kaam kiya hai.",
            "Formatting ko single-column rakhein taaki neural engine fast scan kar sake."
        ]
    else:
        explanation = "Excellent! Aapka profile top-tier hai aur hiring chances kafi high hain."
        recommendations = [
            "Ab direct referrals aur LinkedIn networking par focus karein.",
            "Apne top skills ke liye certifications ka ek alag badge lagayein.",
            "Resume ka PDF version hi update rakhein."
        ]

    # Job Recommendations
    recommended_jobs = []
    for skill in found_skills:
        recommended_jobs.extend(job_roles.get(skill, []))
    recommended_jobs = list(set(recommended_jobs))

    return jsonify({
        "score": total_score,
        "skills": found_skills,
        "projects_detected": len(found_projects) > 0,
        "explanation": explanation,
        "recommendations": recommendations,
        "how_to_improve": f"Aapka score badhane ke liye aapko {100 - total_score}% aur depth ki zaroorat hai.",
        "recommended_jobs": recommended_jobs
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)