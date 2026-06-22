"""
routes/resume.py
Resume upload, parsing, analysis, and retrieval endpoints
"""
import os
import logging
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId

from config.database import get_db
from config.settings import Config
from models.schemas import resume_schema
from middleware.auth_middleware import token_required
from utils.helpers import allowed_file, save_uploaded_file, serialize_doc
from utils.resume_parser import ResumeParser
from utils.skill_extractor import SkillExtractor
from utils.ats_scorer import ATSScorer
from utils.job_recommender import JobRecommender

logger = logging.getLogger(__name__)
resume_bp = Blueprint("resume", __name__, url_prefix="/api/resume")


def _get_helper_instances():
    """Instantiate helpers with live DB data"""
    db         = get_db()
    skills_db  = list(db.skills.find({}, {"_id": 0}))
    roles_db   = list(db.job_roles.find({"is_active": True}, {"_id": 0, "created_at": 0, "updated_at": 0}))
    extractor  = SkillExtractor(skills_db)
    recommender = JobRecommender(roles_db)
    scorer     = ATSScorer()
    parser     = ResumeParser()
    return parser, extractor, scorer, recommender


# ── Upload Resume ─────────────────────────────────────────────────────────

@resume_bp.route("/upload", methods=["POST"])
@token_required
def upload_resume():
    user_id = get_jwt_identity()

    if "resume" not in request.files:
        return jsonify({"success": False, "message": "No file uploaded"}), 400

    file = request.files["resume"]
    if file.filename == "":
        return jsonify({"success": False, "message": "No file selected"}), 400
    if not allowed_file(file.filename):
        return jsonify({"success": False, "message": "Only PDF files are allowed"}), 400

    # Save file
    upload_folder = current_app.config.get("UPLOAD_FOLDER", Config.UPLOAD_FOLDER)
    unique_name, file_path = save_uploaded_file(file, upload_folder)

    # Create resume document
    db       = get_db()
    doc      = resume_schema(user_id, unique_name, file_path)
    result   = db.resumes.insert_one(doc)
    resume_id = str(result.inserted_id)

    # Update user resume count
    db.users.update_one({"_id": ObjectId(user_id)}, {"$inc": {"resume_count": 1}})

    # Trigger async analysis (sync in this implementation)
    try:
        _analyze_resume(resume_id, file_path)
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        db.resumes.update_one(
            {"_id": ObjectId(resume_id)},
            {"$set": {"status": "failed"}}
        )

    resume = db.resumes.find_one({"_id": ObjectId(resume_id)})
    return jsonify({
        "success":   True,
        "message":   "Resume uploaded and analyzed",
        "resume_id": resume_id,
        "resume":    serialize_doc(resume)
    }), 201


def _analyze_resume(resume_id: str, file_path: str):
    """Core analysis pipeline — parse → extract skills → score → recommend"""
    db = get_db()
    parser, extractor, scorer, recommender = _get_helper_instances()

    # 1. Parse PDF
    parsed = parser.parse(file_path)

    # 2. Extract skills from full text + skills section
    all_skills = extractor.extract(
        parsed.get("raw_text", ""),
        parsed.get("skills", [])
    )

    # 3. ATS score
    score_result = scorer.calculate(parsed, all_skills)

    # 4. Job recommendations
    recommended  = recommender.recommend(all_skills, top_n=6)

    # 5. Missing skills for top role
    missing_skills = []
    if recommended:
        top_role = recommended[0]
        missing_skills = extractor.get_missing_skills(
            all_skills, top_role.get("required_skills", [])
        )

    # 6. Improvement suggestions
    suggestions = scorer.generate_suggestions(
        parsed, all_skills, score_result["total_score"]
    )

    # 7. Persist results
    update = {
        "status":      "processed",
        "parsed_data": {
            "full_name":      parsed.get("full_name", ""),
            "email":          parsed.get("email", ""),
            "phone":          parsed.get("phone", ""),
            "linkedin":       parsed.get("linkedin", ""),
            "github":         parsed.get("github", ""),
            "summary":        parsed.get("summary", ""),
            "education":      parsed.get("education", []),
            "experience":     parsed.get("experience", []),
            "projects":       parsed.get("projects", []),
            "skills":         all_skills,
            "certifications": parsed.get("certifications", []),
            "languages":      parsed.get("languages", []),
        },
        "ats_score":                score_result["total_score"],
        "score_breakdown":          score_result["breakdown"],
        "recommended_jobs":         recommended,
        "missing_skills":           missing_skills,
        "improvement_suggestions":  suggestions,
        "processed_at":             datetime.utcnow(),
        "updated_at":               datetime.utcnow(),
    }

    db.resumes.update_one(
        {"_id": ObjectId(resume_id)},
        {"$set": update}
    )
    logger.info(f"Resume {resume_id} analysed. Score: {score_result['total_score']}/100")


# ── Get My Resumes ────────────────────────────────────────────────────────

@resume_bp.route("/my-resumes", methods=["GET"])
@token_required
def get_my_resumes():
    user_id = get_jwt_identity()
    db      = get_db()
    resumes = list(db.resumes.find(
        {"user_id": ObjectId(user_id)},
        {"file_path": 0}           # don't expose server path
    ).sort("uploaded_at", -1))

    return jsonify({
        "success": True,
        "resumes": [serialize_doc(r) for r in resumes],
        "count":   len(resumes)
    })


# ── Get Single Resume ─────────────────────────────────────────────────────

@resume_bp.route("/<resume_id>", methods=["GET"])
@token_required
def get_resume(resume_id):
    user_id = get_jwt_identity()
    db      = get_db()

    try:
        resume = db.resumes.find_one({
            "_id":     ObjectId(resume_id),
            "user_id": ObjectId(user_id)
        }, {"file_path": 0})
    except Exception:
        return jsonify({"success": False, "message": "Invalid resume ID"}), 400

    if not resume:
        return jsonify({"success": False, "message": "Resume not found"}), 404

    return jsonify({"success": True, "resume": serialize_doc(resume)})


# ── Delete Resume ─────────────────────────────────────────────────────────

@resume_bp.route("/<resume_id>", methods=["DELETE"])
@token_required
def delete_resume(resume_id):
    user_id = get_jwt_identity()
    db      = get_db()

    resume = db.resumes.find_one({
        "_id":     ObjectId(resume_id),
        "user_id": ObjectId(user_id)
    })
    if not resume:
        return jsonify({"success": False, "message": "Resume not found"}), 404

    # Remove file from disk
    try:
        if os.path.exists(resume.get("file_path", "")):
            os.remove(resume["file_path"])
    except Exception as e:
        logger.warning(f"Could not delete file: {e}")

    db.resumes.delete_one({"_id": ObjectId(resume_id)})
    db.users.update_one({"_id": ObjectId(user_id)}, {"$inc": {"resume_count": -1}})

    return jsonify({"success": True, "message": "Resume deleted"})


# ── Re-analyze Resume ─────────────────────────────────────────────────────

@resume_bp.route("/<resume_id>/analyze", methods=["POST"])
@token_required
def reanalyze_resume(resume_id):
    user_id = get_jwt_identity()
    db      = get_db()

    resume = db.resumes.find_one({
        "_id":     ObjectId(resume_id),
        "user_id": ObjectId(user_id)
    })
    if not resume:
        return jsonify({"success": False, "message": "Resume not found"}), 404

    file_path = resume.get("file_path")
    if not file_path or not os.path.exists(file_path):
        return jsonify({"success": False, "message": "Resume file not found on server"}), 404

    db.resumes.update_one({"_id": ObjectId(resume_id)}, {"$set": {"status": "pending"}})
    _analyze_resume(resume_id, file_path)

    updated = db.resumes.find_one({"_id": ObjectId(resume_id)}, {"file_path": 0})
    return jsonify({"success": True, "message": "Resume re-analyzed", "resume": serialize_doc(updated)})


# ── Dashboard Stats ───────────────────────────────────────────────────────

@resume_bp.route("/dashboard/stats", methods=["GET"])
@token_required
def dashboard_stats():
    user_id = get_jwt_identity()
    db      = get_db()

    resumes = list(db.resumes.find({"user_id": ObjectId(user_id)}).sort("uploaded_at", -1))

    if not resumes:
        return jsonify({
            "success": True,
            "stats": {
                "total_resumes":     0,
                "best_score":        0,
                "avg_score":         0,
                "latest_resume":     None,
                "top_skills":        [],
                "top_jobs":          [],
                "score_history":     [],
            }
        })

    scores      = [r.get("ats_score", 0) for r in resumes]
    latest      = resumes[0]

    # Aggregate skills across all resumes
    all_skills  = {}
    for r in resumes:
        for s in r.get("parsed_data", {}).get("skills", []):
            all_skills[s] = all_skills.get(s, 0) + 1
    top_skills  = sorted(all_skills, key=all_skills.get, reverse=True)[:10]

    # Score history
    score_history = [
        {"date": r["uploaded_at"].isoformat(), "score": r.get("ats_score", 0)}
        for r in reversed(resumes[-10:])
    ]

    return jsonify({
        "success": True,
        "stats": {
            "total_resumes":  len(resumes),
            "best_score":     max(scores),
            "avg_score":      round(sum(scores) / len(scores)),
            "latest_resume":  serialize_doc(latest),
            "top_skills":     top_skills,
            "top_jobs":       latest.get("recommended_jobs", [])[:4],
            "score_history":  score_history,
        }
    })
