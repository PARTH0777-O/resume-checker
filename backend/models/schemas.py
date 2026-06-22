"""
models/schemas.py
MongoDB document schemas and validation
"""
from datetime import datetime
from bson import ObjectId


# ─────────────────────────────────────────
#  USER SCHEMA
# ─────────────────────────────────────────
def user_schema(name, email, password_hash, role="user"):
    return {
        "name": name,
        "email": email.lower().strip(),
        "password": password_hash,
        "role": role,                    # "user" | "admin"
        "profile": {
            "phone": "",
            "location": "",
            "linkedin": "",
            "github": "",
            "website": "",
            "summary": ""
        },
        "resume_count": 0,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_login": None
    }


# ─────────────────────────────────────────
#  RESUME SCHEMA
# ─────────────────────────────────────────
def resume_schema(user_id, filename, file_path):
    return {
        "user_id": ObjectId(user_id),
        "filename": filename,
        "file_path": file_path,
        "status": "pending",            # "pending" | "processed" | "failed"

        # Parsed Data
        "parsed_data": {
            "full_name": "",
            "email": "",
            "phone": "",
            "location": "",
            "linkedin": "",
            "github": "",
            "education": [],
            "experience": [],
            "projects": [],
            "skills": [],
            "certifications": [],
            "languages": [],
            "summary": ""
        },

        # Analysis Results
        "ats_score": 0,
        "score_breakdown": {
            "skills_score": 0,
            "education_score": 0,
            "experience_score": 0,
            "projects_score": 0,
            "certifications_score": 0,
            "completeness_score": 0
        },

        # Recommendations
        "recommended_jobs": [],          # [{title, match_percentage, required_skills}]
        "missing_skills": [],
        "improvement_suggestions": [],

        "uploaded_at": datetime.utcnow(),
        "processed_at": None,
        "updated_at": datetime.utcnow()
    }


# ─────────────────────────────────────────
#  JOB ROLE SCHEMA
# ─────────────────────────────────────────
def job_role_schema(title, category, required_skills, preferred_skills=None,
                    description="", salary_range=""):
    return {
        "title": title,
        "category": category,
        "description": description,
        "required_skills": required_skills,        # list[str]
        "preferred_skills": preferred_skills or [],
        "salary_range": salary_range,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }


# ─────────────────────────────────────────
#  SKILL SCHEMA
# ─────────────────────────────────────────
def skill_schema(name, category, aliases=None, weight=1.0):
    return {
        "name": name.lower().strip(),
        "display_name": name,
        "category": category,           # "programming" | "framework" | "database" | "cloud" | "tool" | "soft"
        "aliases": aliases or [],
        "weight": weight,               # importance weight 0.0-1.0
        "is_active": True,
        "created_at": datetime.utcnow()
    }


# ─────────────────────────────────────────
#  RECOMMENDATION SCHEMA
# ─────────────────────────────────────────
def recommendation_schema(user_id, resume_id, job_roles):
    return {
        "user_id": ObjectId(user_id),
        "resume_id": ObjectId(resume_id),
        "recommended_roles": job_roles,
        "created_at": datetime.utcnow()
    }
