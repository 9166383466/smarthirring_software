from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import os  # <--- Ye zaroori hai port check karne ke liye

app = Flask(__name__)
CORS(app) 

job_roles = {
    "python": ["Python Developer", "Data Analyst", "AI/ML Engineer"],
    "java": ["Java Developer", "Backend Developer"],
    "sql": ["Database Administrator", "Data Analyst"],
    "react": ["Frontend Developer", "React Developer"],
    "javascript": ["Frontend Developer", "Full Stack Developer"],
    "c++": ["Software Engineer", "Game Developer"]
}

def extract_text(file):
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        if page.extract_text():
            text += page.extract_text()
    return text

@app.route('/analyze', methods=['POST'])
def analyze():
    # Frontend se 'resume' key aani chahiye
    if 'resume' not in request.files:
        return jsonify({"error": "No file uploaded ❌"}), 400

    file = request.files['resume']
    try:
        # File stream ko extract function mein bhejna
        text = extract_text(file).lower()
    except Exception as e:
        return jsonify({"error": f"PDF read error ❌ {str(e)}"}), 500

    skills_list = list(job_roles.keys())
    found = [s for s in skills_list if s in text]
    score = min(len(found) * 20, 100) # Score 100 se upar na jaye
    suggestions = [s.capitalize() for s in skills_list if s not in found]

    found_jobs = []
    for skill in found:
        found_jobs.extend(job_roles.get(skill, []))
    found_jobs = list(set(found_jobs)) 

    return jsonify({
        "skills": found,
        "score": score,
        "suggestions": suggestions,
        "recommended_jobs": found_jobs
    })

# --- YAHAN CHANGE HAI (SABSE ZAROORI) ---
if __name__ == "__main__":
    # Render hamesha PORT environment variable bhejta hai
    port = int(os.environ.get("PORT", 10000)) 
    # host '0.0.0.0' hona zaroori hai Render ke liye
    app.run(host='0.0.0.0', port=port)