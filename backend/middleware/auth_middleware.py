"""
middleware/auth_middleware.py
JWT authentication middleware and decorators
"""
from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from config.database import get_db
from bson import ObjectId


def token_required(f):
    """Decorator to protect routes with JWT authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            db = get_db()
            user = db.users.find_one({"_id": ObjectId(user_id)})
            if not user:
                return jsonify({"success": False, "message": "User not found"}), 401
            if not user.get("is_active", True):
                return jsonify({"success": False, "message": "Account is deactivated"}), 401
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"success": False, "message": "Invalid or expired token"}), 401
    return decorated


def admin_required(f):
    """Decorator to protect admin-only routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            db = get_db()
            user = db.users.find_one({"_id": ObjectId(user_id)})
            if not user:
                return jsonify({"success": False, "message": "User not found"}), 401
            if user.get("role") != "admin":
                return jsonify({"success": False, "message": "Admin access required"}), 403
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"success": False, "message": "Unauthorized"}), 401
    return decorated
