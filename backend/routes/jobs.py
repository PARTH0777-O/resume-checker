"""
routes/jobs.py
Public job roles and skills endpoints
"""
from flask import Blueprint, jsonify, request
from config.database import get_db
from utils.helpers import serialize_doc

jobs_bp = Blueprint("jobs", __name__, url_prefix="/api/jobs")


@jobs_bp.route("/", methods=["GET"])
def get_jobs():
    db       = get_db()
    category = request.args.get("category")
    query    = {"is_active": True}
    if category:
        query["category"] = category
    roles    = list(db.job_roles.find(query, {"_id": 1, "title": 1, "category": 1,
                                              "description": 1, "required_skills": 1,
                                              "preferred_skills": 1, "salary_range": 1})
                    .sort("title", 1))
    return jsonify({"success": True, "roles": [serialize_doc(r) for r in roles]})


@jobs_bp.route("/categories", methods=["GET"])
def get_categories():
    db   = get_db()
    cats = db.job_roles.distinct("category", {"is_active": True})
    return jsonify({"success": True, "categories": sorted(cats)})


@jobs_bp.route("/skills", methods=["GET"])
def get_skills():
    db     = get_db()
    cat    = request.args.get("category")
    query  = {"is_active": True}
    if cat:
        query["category"] = cat
    skills = list(db.skills.find(query, {"_id": 0, "display_name": 1, "category": 1, "weight": 1})
                  .sort("name", 1))
    return jsonify({"success": True, "skills": skills})
