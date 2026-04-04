from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import os

app = Flask(__name__)
CORS(app)

# AI Knowledge Base
job_roles = {
    "python": ["Backend Developer", "Data Scientist", "Software Engineer"],
    "react": ["Frontend Developer", "UI/UX Engineer"],
    "node": ["Backend Developer", "Full Stack Developer"],
    "javascript": ["Web Developer", "App Developer"],
    "mongodb": ["Database Administrator"],
    "sql": ["Data Analyst", "Database Engineer"],
    "java":["Data engineering "],
    "html": ["Frontend Developer"],
    "css":["Web Developer"]
}

project_keywords = ["github", "deployed", "live link", "api", "database", "optimized", "developed", "portfolio"]

def extract_text(file):
    with pdfplumber.open(file) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'resume' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['resume']
    try:
        raw_text = extract_text(file).lower()
    except Exception as e:
        return jsonify({"error": "Failed to parse PDF"}), 500

    # --- AI SCORING ENGINE ---
    skills_list = list(job_roles.keys())
    found_skills = [s for s in skills_list if s in raw_text]
    found_projects = [p for p in project_keywords if p in raw_text]
    
    score = min((len(found_skills) * 15) + (len(found_projects) * 5), 100)

    # --- PROFESSIONAL ENGLISH FEEDBACK ---
    explanation = ""
    recommendations = []

    if score < 50:
        explanation = "Your ATS score is currently low due to a lack of industry-standard keywords and verifiable project links."
        recommendations = [
            "Enhance your 'Technical Skills' section with more relevant stack keywords.",
            "Mandatory: Include 'GitHub' or 'Live Demo' links for your projects.",
            "Use a clean, single-column format to ensure ATS readability."
        ]
    elif score < 85:
        explanation = "Great foundation! Your resume is professional, but needs minor optimizations to reach the top-tier candidate pool."
        recommendations = [
            "Add quantitative data (e.g., 'Improved performance by 30%') to your experience.",
            "Include keywords for DevOps tools like Docker, AWS, or Git if applicable.",
            "Refine your professional summary to highlight your unique value proposition."
        ]
    else:
        explanation = "Excellent! Your profile is highly optimized and ready for top-tier corporate ATS systems."
        recommendations = [
            "Focus on direct LinkedIn networking and referrals for faster results.",
            "Create a separate section for professional certifications and badges.",
            "Keep your Portfolio/GitHub updated with your latest contributions."
        ]

    return jsonify({
        "score": score,
        "skills": found_skills,
        "explanation": explanation,
        "recommendations": recommendations,
        "how_to_improve": f"To boost your score by another {100 - score}%, focus on project depth and specific metrics."
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)