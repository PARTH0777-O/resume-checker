"""
app.py
Flask application factory and entry point
"""
import os
import logging
from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config.settings import Config
from config.database import Database
from routes import auth_bp, resume_bp, admin_bp, jobs_bp

# ── Logging ───────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)


def create_app(config_class=Config):
    app = Flask(__name__)

    # ── Configuration ─────────────────────────────────────────────────────
    app.config.from_object(config_class)
    app.config["UPLOAD_FOLDER"]      = Config.UPLOAD_FOLDER
    app.config["MAX_CONTENT_LENGTH"] = Config.MAX_CONTENT_LENGTH
    app.config["JWT_SECRET_KEY"]     = Config.JWT_SECRET_KEY
    app.config["JWT_ACCESS_TOKEN_EXPIRES"]  = Config.JWT_ACCESS_TOKEN_EXPIRES
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = Config.JWT_REFRESH_TOKEN_EXPIRES

    # ── Extensions ────────────────────────────────────────────────────────
    CORS(app, resources={r"/api/*": {"origins": "*"}},
         supports_credentials=True)
    JWTManager(app)

    # ── Database ──────────────────────────────────────────────────────────
    with app.app_context():
        Database.connect()
        _ensure_admin()
        _ensure_upload_folder()

    # ── Blueprints ────────────────────────────────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(jobs_bp)

    # ── Health Check ──────────────────────────────────────────────────────
    @app.route("/api/health")
    def health():
        return jsonify({
            "status":  "healthy",
            "service": "Smart Resume Analyzer API",
            "version": "1.0.0",
            "time":    datetime.utcnow().isoformat()
        })

    # ── Error Handlers ────────────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Endpoint not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"success": False, "message": "Method not allowed"}), 405

    @app.errorhandler(413)
    def payload_too_large(e):
        return jsonify({"success": False, "message": "File too large. Maximum 16MB"}), 413

    @app.errorhandler(500)
    def internal_error(e):
        logger.error(f"Internal error: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

    return app


def _ensure_admin():
    """Create default admin account if not present"""
    from config.database import get_db
    import bcrypt
    db = get_db()
    if not db.users.find_one({"role": "admin"}):
        hashed = bcrypt.hashpw(Config.ADMIN_PASSWORD.encode(), bcrypt.gensalt()).decode()
        db.users.insert_one({
            "name":         "Admin",
            "email":        Config.ADMIN_EMAIL,
            "password":     hashed,
            "role":         "admin",
            "is_active":    True,
            "resume_count": 0,
            "profile":      {},
            "created_at":   datetime.utcnow(),
            "updated_at":   datetime.utcnow(),
            "last_login":   None,
        })
        logger.info(f"Admin account created: {Config.ADMIN_EMAIL}")


def _ensure_upload_folder():
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)


# ── Entry Point ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    app = create_app()
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=Config.DEBUG,
        use_reloader=False
    )
