"""
routes/admin.py
Admin panel endpoints: users, analytics, job roles, skills management
"""
import bcrypt
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId

from config.database import get_db
from models.schemas import job_role_schema, skill_schema
from models.seed_data import JOB_ROLES_SEED, SKILLS_SEED
from middleware.auth_middleware import admin_required
from utils.helpers import serialize_doc

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


# ── Dashboard Analytics ───────────────────────────────────────────────────

@admin_bp.route("/analytics", methods=["GET"])
@admin_required
def analytics():
    db = get_db()

    total_users    = db.users.count_documents({"role": "user"})
    total_resumes  = db.resumes.count_documents({})
    processed      = db.resumes.count_documents({"status": "processed"})
    scores         = list(db.resumes.find({"status": "processed"}, {"ats_score": 1}))
    avg_score      = round(sum(r.get("ats_score", 0) for r in scores) / max(len(scores), 1))

    # Score distribution
    distribution   = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    for r in scores:
        s = r.get("ats_score", 0)
        if s <= 20:   distribution["0-20"]   += 1
        elif s <= 40: distribution["21-40"]  += 1
        elif s <= 60: distribution["41-60"]  += 1
        elif s <= 80: distribution["61-80"]  += 1
        else:         distribution["81-100"] += 1

    # Recent users
    recent_users   = list(db.users.find({}, {"password": 0}).sort("created_at", -1).limit(5))

    # Top skills across all resumes
    skill_count = {}
    for r in db.resumes.find({"status": "processed"}, {"parsed_data.skills": 1}):
        for s in r.get("parsed_data", {}).get("skills", []):
            skill_count[s] = skill_count.get(s, 0) + 1
    top_skills = sorted(skill_count.items(), key=lambda x: x[1], reverse=True)[:10]

    return jsonify({
        "success": True,
        "analytics": {
            "total_users":       total_users,
            "total_resumes":     total_resumes,
            "processed_resumes": processed,
            "avg_ats_score":     avg_score,
            "score_distribution": distribution,
            "recent_users":      [serialize_doc(u) for u in recent_users],
            "top_skills":        [{"skill": k, "count": v} for k, v in top_skills],
        }
    })


# ── Users Management ──────────────────────────────────────────────────────

@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_users():
    db   = get_db()
    page = int(request.args.get("page", 1))
    per  = int(request.args.get("per_page", 10))
    skip = (page - 1) * per

    total = db.users.count_documents({"role": {"$ne": "admin"}})
    users = list(db.users.find({"role": {"$ne": "admin"}}, {"password": 0})
                 .sort("created_at", -1).skip(skip).limit(per))

    return jsonify({
        "success":     True,
        "users":       [serialize_doc(u) for u in users],
        "total":       total,
        "page":        page,
        "total_pages": (total + per - 1) // per,
    })


@admin_bp.route("/users/<user_id>", methods=["GET"])
@admin_required
def get_user(user_id):
    db   = get_db()
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    resumes = list(db.resumes.find({"user_id": ObjectId(user_id)}, {"file_path": 0})
                   .sort("uploaded_at", -1))
    return jsonify({
        "success": True,
        "user":    serialize_doc(user),
        "resumes": [serialize_doc(r) for r in resumes],
    })


@admin_bp.route("/users/<user_id>/toggle", methods=["PATCH"])
@admin_required
def toggle_user(user_id):
    db   = get_db()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    new_status = not user.get("is_active", True)
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_active": new_status}})
    status_str = "activated" if new_status else "deactivated"
    return jsonify({"success": True, "message": f"User {status_str}", "is_active": new_status})


# ── Resumes Management ────────────────────────────────────────────────────

@admin_bp.route("/resumes", methods=["GET"])
@admin_required
def get_all_resumes():
    db   = get_db()
    page = int(request.args.get("page", 1))
    per  = int(request.args.get("per_page", 10))
    skip = (page - 1) * per

    total   = db.resumes.count_documents({})
    resumes = list(db.resumes.find({}, {"file_path": 0})
                   .sort("uploaded_at", -1).skip(skip).limit(per))

    # Attach user names
    for r in resumes:
        u = db.users.find_one({"_id": r.get("user_id")}, {"name": 1, "email": 1})
        r["user"] = serialize_doc(u) if u else {}

    return jsonify({
        "success":     True,
        "resumes":     [serialize_doc(r) for r in resumes],
        "total":       total,
        "page":        page,
        "total_pages": (total + per - 1) // per,
    })


# ── Job Roles Management ──────────────────────────────────────────────────

@admin_bp.route("/job-roles", methods=["GET"])
@admin_required
def get_job_roles():
    db    = get_db()
    roles = list(db.job_roles.find({}).sort("title", 1))
    return jsonify({"success": True, "roles": [serialize_doc(r) for r in roles]})


@admin_bp.route("/job-roles", methods=["POST"])
@admin_required
def create_job_role():
    data     = request.get_json()
    required = ["title", "category", "required_skills"]
    if not all(data.get(k) for k in required):
        return jsonify({"success": False, "message": "Title, category and required_skills are needed"}), 400

    db = get_db()
    if db.job_roles.find_one({"title": data["title"]}):
        return jsonify({"success": False, "message": "Job role already exists"}), 409

    role   = job_role_schema(
        title=data["title"],
        category=data["category"],
        required_skills=data["required_skills"],
        preferred_skills=data.get("preferred_skills", []),
        description=data.get("description", ""),
        salary_range=data.get("salary_range", ""),
    )
    result = db.job_roles.insert_one(role)
    role["_id"] = result.inserted_id
    return jsonify({"success": True, "message": "Job role created", "role": serialize_doc(role)}), 201


@admin_bp.route("/job-roles/<role_id>", methods=["PUT"])
@admin_required
def update_job_role(role_id):
    data    = request.get_json()
    db      = get_db()
    allowed = ["title", "category", "required_skills", "preferred_skills",
               "description", "salary_range", "is_active"]
    update  = {k: v for k, v in data.items() if k in allowed}
    update["updated_at"] = datetime.utcnow()
    db.job_roles.update_one({"_id": ObjectId(role_id)}, {"$set": update})
    return jsonify({"success": True, "message": "Job role updated"})


@admin_bp.route("/job-roles/<role_id>", methods=["DELETE"])
@admin_required
def delete_job_role(role_id):
    db = get_db()
    db.job_roles.delete_one({"_id": ObjectId(role_id)})
    return jsonify({"success": True, "message": "Job role deleted"})


# ── Skills Management ─────────────────────────────────────────────────────

@admin_bp.route("/skills", methods=["GET"])
@admin_required
def get_skills():
    db     = get_db()
    skills = list(db.skills.find({}).sort("name", 1))
    return jsonify({"success": True, "skills": [serialize_doc(s) for s in skills]})


@admin_bp.route("/skills", methods=["POST"])
@admin_required
def create_skill():
    data = request.get_json()
    if not data.get("name") or not data.get("category"):
        return jsonify({"success": False, "message": "Name and category are required"}), 400

    db = get_db()
    if db.skills.find_one({"name": data["name"].lower()}):
        return jsonify({"success": False, "message": "Skill already exists"}), 409

    s      = skill_schema(data["name"], data["category"], data.get("aliases", []))
    result = db.skills.insert_one(s)
    s["_id"] = result.inserted_id
    return jsonify({"success": True, "message": "Skill created", "skill": serialize_doc(s)}), 201


@admin_bp.route("/skills/<skill_id>", methods=["DELETE"])
@admin_required
def delete_skill(skill_id):
    db = get_db()
    db.skills.delete_one({"_id": ObjectId(skill_id)})
    return jsonify({"success": True, "message": "Skill deleted"})


# ── Seed Database ─────────────────────────────────────────────────────────

@admin_bp.route("/seed", methods=["POST"])
@admin_required
def seed_database():
    db = get_db()
    jobs_added   = 0
    skills_added = 0

    for role in JOB_ROLES_SEED:
        if not db.job_roles.find_one({"title": role["title"]}):
            db.job_roles.insert_one({**role, "is_active": True,
                                     "created_at": datetime.utcnow(),
                                     "updated_at": datetime.utcnow()})
            jobs_added += 1

    for sk in SKILLS_SEED:
        sname = sk["name"].lower()
        if not db.skills.find_one({"name": sname}):
            db.skills.insert_one({
                "name":         sname,
                "display_name": sk["name"],
                "category":     sk["category"],
                "aliases":      sk.get("aliases", []),
                "weight":       sk.get("weight", 1.0),
                "is_active":    True,
                "created_at":   datetime.utcnow(),
            })
            skills_added += 1

    return jsonify({
        "success": True,
        "message": f"Seeded {jobs_added} job roles and {skills_added} skills",
    })
