import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename

upload_bp = Blueprint("uploads", __name__)


def _extension(filename):
    return filename.rsplit(".", 1)[1].lower() if "." in filename else ""


@upload_bp.route("/", methods=["POST"])
@jwt_required()
def upload_file():
    """
    Accepts multipart/form-data with a 'file' field.
    Optional 'kind' field: 'image' (default) or 'document' - controls which
    extensions are allowed. Certifications can be a PDF; chat/review photos
    must be actual images.
    Returns { "url": "/api/uploads/<generated-filename>" }
    """
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    kind = request.form.get("kind", "image")
    allowed = (
        current_app.config["ALLOWED_DOCUMENT_EXTENSIONS"]
        if kind == "document"
        else current_app.config["ALLOWED_IMAGE_EXTENSIONS"]
    )

    ext = _extension(file.filename)
    if ext not in allowed:
        return jsonify({
            "error": f"File type .{ext or '?'} not allowed. Use one of: {', '.join(sorted(allowed))}"
        }), 400

    safe_name = secure_filename(file.filename)
    unique_name = f"{uuid.uuid4().hex}_{safe_name}"

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)
    file.save(os.path.join(upload_folder, unique_name))

    return jsonify({"url": f"/api/uploads/{unique_name}", "filename": unique_name}), 201


@upload_bp.route("/<path:filename>", methods=["GET"])
def get_upload(filename):
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filename)
