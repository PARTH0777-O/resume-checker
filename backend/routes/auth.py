"""
routes/auth.py
Authentication endpoints: register, login, logout, profile
"""
import bcrypt
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from bson import ObjectId

from config.database import get_db
from models.schemas import user_schema
from middleware.auth_middleware import token_required
from utils.helpers import serialize_doc

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# ── Register ──────────────────────────────────────────────────────────────

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name     = (data.get("name") or "").strip()
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not all([name, email, password]):
        return jsonify({"success": False, "message": "Name, email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400

    db = get_db()
    if db.users.find_one({"email": email}):
        return jsonify({"success": False, "message": "Email already registered"}), 409

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user   = user_schema(name, email, hashed)
    result = db.users.insert_one(user)

    access_token  = create_access_token(identity=str(result.inserted_id))
    refresh_token = create_refresh_token(identity=str(result.inserted_id))

    return jsonify({
        "success":       True,
        "message":       "Registration successful",
        "access_token":  access_token,
        "refresh_token": refresh_token,
        "user": {
            "id":    str(result.inserted_id),
            "name":  name,
            "email": email,
            "role":  "user",
        }
    }), 201


# ── Login ─────────────────────────────────────────────────────────────────

@auth_bp.route("/login", methods=["POST"])
def login():
    data     = request.get_json()
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required"}), 400

    db   = get_db()
    user = db.users.find_one({"email": email})

    if not user or not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401
    if not user.get("is_active", True):
        return jsonify({"success": False, "message": "Account has been deactivated"}), 403

    db.users.update_one({"_id": user["_id"]}, {"$set": {"last_login": datetime.utcnow()}})

    access_token  = create_access_token(identity=str(user["_id"]))
    refresh_token = create_refresh_token(identity=str(user["_id"]))

    return jsonify({
        "success":       True,
        "message":       "Login successful",
        "access_token":  access_token,
        "refresh_token": refresh_token,
        "user": {
            "id":    str(user["_id"]),
            "name":  user["name"],
            "email": user["email"],
            "role":  user.get("role", "user"),
        }
    })


# ── Refresh Token ─────────────────────────────────────────────────────────

@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id      = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify({"success": True, "access_token": access_token})


# ── Get Profile ───────────────────────────────────────────────────────────

@auth_bp.route("/profile", methods=["GET"])
@token_required
def get_profile():
    user_id = get_jwt_identity()
    db      = get_db()
    user    = db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    return jsonify({"success": True, "user": serialize_doc(user)})


# ── Update Profile ────────────────────────────────────────────────────────

@auth_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile():
    user_id = get_jwt_identity()
    data    = request.get_json()
    db      = get_db()

    allowed = ["name", "profile"]
    update  = {k: v for k, v in data.items() if k in allowed}
    update["updated_at"] = datetime.utcnow()

    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update})
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    return jsonify({"success": True, "message": "Profile updated", "user": serialize_doc(user)})


# ── Change Password ────────────────────────────────────────────────────────

@auth_bp.route("/change-password", methods=["POST"])
@token_required
def change_password():
    user_id      = get_jwt_identity()
    data         = request.get_json()
    old_password = data.get("old_password") or ""
    new_password = data.get("new_password") or ""

    if not old_password or not new_password:
        return jsonify({"success": False, "message": "Both passwords are required"}), 400
    if len(new_password) < 6:
        return jsonify({"success": False, "message": "New password must be at least 6 characters"}), 400

    db   = get_db()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not bcrypt.checkpw(old_password.encode(), user["password"].encode()):
        return jsonify({"success": False, "message": "Current password is incorrect"}), 400

    hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    db.users.update_one({"_id": ObjectId(user_id)}, {
        "$set": {"password": hashed, "updated_at": datetime.utcnow()}
    })
    return jsonify({"success": True, "message": "Password changed successfully"})
