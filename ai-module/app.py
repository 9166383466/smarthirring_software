from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2

app = Flask(__name__)
CORS(app)  # Allow frontend to access

# Skill → Recommended Job mapping
job_roles = {
    "python": ["Python Developer", "Data Analyst", "AI/ML Engineer"],
    "java": ["Java Developer", "Backend Developer"],
    "sql": ["Database Administrator", "Data Analyst"],
    "react": ["Frontend Developer", "React Developer"],
    "javascript": ["Frontend Developer", "Full Stack Developer"],
    "c++": ["Software Engineer", "Game Developer"]
}

# PDF text extract function
def extract_text(file):
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        if page.extract_text():
            text += page.extract_text()
    return text

# API route
@app.route('/analyze', methods=['POST'])
def analyze():
    if 'resume' not in request.files:
        return jsonify({"error": "No file uploaded ❌"}), 400

    file = request.files['resume']
    try:
        text = extract_text(file).lower()
    except Exception as e:
        return jsonify({"error": f"PDF read error ❌ {str(e)}"}), 500

    # Detect skills
    skills_list = list(job_roles.keys())
    found = [s for s in skills_list if s in text]

    # Score
    score = len(found) * 30

    # Suggestions
    suggestions = [s.capitalize() for s in skills_list if s not in found]

    # Recommended jobs
    found_jobs = []
    for skill in found:
        found_jobs.extend(job_roles.get(skill, []))
    found_jobs = list(set(found_jobs))  # remove duplicates

    return jsonify({
        "skills": found,
        "score": score,
        "suggestions": suggestions,
        "recommended_jobs": found_jobs
    })

if __name__ == "__main__":
    app.run(port=8000)