"""
utils/helpers.py
Shared utility functions
"""
import os
import uuid
import logging
from werkzeug.utils import secure_filename
from config.settings import Config

logger = logging.getLogger(__name__)


def allowed_file(filename: str) -> bool:
    """Check if file has an allowed extension"""
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS


def save_uploaded_file(file, upload_folder: str) -> tuple:
    """
    Save uploaded file with a unique name.
    Returns (unique_filename, file_path)
    """
    original_name = secure_filename(file.filename)
    ext           = original_name.rsplit(".", 1)[-1].lower()
    unique_name   = f"{uuid.uuid4().hex}.{ext}"
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, unique_name)
    file.save(file_path)
    return unique_name, file_path


def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serialisable dict"""
    from bson import ObjectId
    from datetime import datetime
    if doc is None:
        return {}
    result = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            result[k] = str(v)
        elif isinstance(v, datetime):
            result[k] = v.isoformat()
        elif isinstance(v, dict):
            result[k] = serialize_doc(v)
        elif isinstance(v, list):
            result[k] = [serialize_doc(i) if isinstance(i, dict) else
                         (str(i) if isinstance(i, ObjectId) else i) for i in v]
        else:
            result[k] = v
    return result


def paginate(query_result, page: int, per_page: int) -> dict:
    """Simple pagination helper"""
    total  = len(query_result)
    start  = (page - 1) * per_page
    end    = start + per_page
    items  = query_result[start:end]
    return {
        "items":       items,
        "total":       total,
        "page":        page,
        "per_page":    per_page,
        "total_pages": (total + per_page - 1) // per_page,
    }
