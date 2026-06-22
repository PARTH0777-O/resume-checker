"""
config/database.py
MongoDB connection and collection management
"""
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure
from config.settings import Config
import logging

logger = logging.getLogger(__name__)

class Database:
    _client = None
    _db = None

    @classmethod
    def connect(cls):
        """Establish MongoDB connection"""
        try:
            cls._client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
            cls._client.admin.command('ping')
            cls._db = cls._client[Config.DB_NAME]
            cls._create_indexes()
            logger.info("✅ MongoDB connected successfully")
            return cls._db
        except ConnectionFailure as e:
            logger.error(f"❌ MongoDB connection failed: {e}")
            raise

    @classmethod
    def get_db(cls):
        if cls._db is None:
            cls.connect()
        return cls._db

    @classmethod
    def _create_indexes(cls):
        """Create database indexes for performance"""
        db = cls._db
        # Users collection indexes
        db.users.create_index([("email", ASCENDING)], unique=True)
        db.users.create_index([("created_at", DESCENDING)])

        # Resumes collection indexes
        db.resumes.create_index([("user_id", ASCENDING)])
        db.resumes.create_index([("uploaded_at", DESCENDING)])
        db.resumes.create_index([("ats_score", DESCENDING)])

        # Job roles indexes
        db.job_roles.create_index([("title", ASCENDING)], unique=True)
        db.job_roles.create_index([("category", ASCENDING)])

        # Skills indexes
        db.skills.create_index([("name", ASCENDING)], unique=True)
        db.skills.create_index([("category", ASCENDING)])

        logger.info("✅ Database indexes created")

    @classmethod
    def disconnect(cls):
        if cls._client:
            cls._client.close()
            logger.info("MongoDB disconnected")

# Global db instance
db_instance = Database()

def get_db():
    return db_instance.get_db()
