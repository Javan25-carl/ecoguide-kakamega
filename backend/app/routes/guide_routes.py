from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.guide import GuideProfile
from app.models.user import User, UserRole

guide_bp = Blueprint("guides", __name__)


@guide_bp.route("/", methods=["GET"])
def list_guides():
    """
    Public listing with optional filters:
    ?language=Swahili&max_price=2000&min_rating=4&available=true
    """
    query = GuideProfile.query.filter_by(is_approved=True)

    language = request.args.get("language")
    if language:
        query = query.filter(GuideProfile.languages.ilike(f"%{language}%"))

    max_price = request.args.get("max_price", type=float)
    if max_price is not None:
        query = query.filter(GuideProfile.hourly_rate <= max_price)

    min_rating = request.args.get("min_rating", type=float)
    if min_rating is not None:
        query = query.filter(GuideProfile.average_rating >= min_rating)

    available = request.args.get("available")
    if available is not None:
        query = query.filter(GuideProfile.is_available == (available.lower() == "true"))

    guides = query.all()
    results = []
    for g in guides:
        data = g.to_dict()
        data["user"] = g.user.to_dict() if g.user else None
        results.append(data)
    return jsonify({"guides": results}), 200


@guide_bp.route("/<guide_id>", methods=["GET"])
@jwt_required(optional=True)
def get_guide(guide_id):
    guide = GuideProfile.query.get(guide_id)
    if not guide:
        return jsonify({"error": "Guide not found"}), 404

    # Unapproved guides shouldn't be publicly viewable or bookable - the
    # list endpoint already filters is_approved=True, so this keeps single
    # fetches consistent instead of leaving a backdoor where anyone with
    # the guide_id (a pending guide sharing their own link, an admin's
    # pending-approvals list) can see a profile that hasn't been vetted.
    # The guide themselves and admins are the exception, so a guide can
    # preview their own pending profile and admins can review it.
    if not guide.is_approved:
        current_user_id = get_jwt_identity()
        is_owner = current_user_id and current_user_id == guide.user_id
        is_admin = False
        if current_user_id and not is_owner:
            requester = User.query.get(current_user_id)
            is_admin = bool(requester and requester.role == UserRole.ADMIN.value)
        if not (is_owner or is_admin):
            return jsonify({"error": "Guide not found"}), 404

    result = guide.to_dict()
    result["user"] = guide.user.to_dict()
    return jsonify({"guide": result}), 200


@guide_bp.route("/me", methods=["GET"])
@jwt_required()
def get_my_guide_profile():
    user_id = get_jwt_identity()
    guide = GuideProfile.query.filter_by(user_id=user_id).first()
    if not guide:
        return jsonify({"error": "Guide profile not found"}), 404
    result = guide.to_dict()
    result["user"] = guide.user.to_dict()
    return jsonify({"guide": result}), 200


@guide_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_my_guide_profile():
    user_id = get_jwt_identity()
    guide = GuideProfile.query.filter_by(user_id=user_id).first()
    if not guide:
        return jsonify({"error": "Guide profile not found"}), 404

    data = request.get_json() or {}
    for field in ["bio", "specialization", "years_experience", "hourly_rate", "certification_url"]:
        if field in data:
            setattr(guide, field, data[field])
    if "languages" in data and isinstance(data["languages"], list):
        guide.languages = ",".join(data["languages"])

    db.session.commit()
    return jsonify({"guide": guide.to_dict()}), 200


@guide_bp.route("/me/availability", methods=["PUT"])
@jwt_required()
def toggle_availability():
    user_id = get_jwt_identity()
    guide = GuideProfile.query.filter_by(user_id=user_id).first()
    if not guide:
        return jsonify({"error": "Guide profile not found"}), 404

    data = request.get_json() or {}
    guide.is_available = bool(data.get("is_available", not guide.is_available))
    db.session.commit()
    return jsonify({"is_available": guide.is_available}), 200


@guide_bp.route("/me/location", methods=["PUT"])
@jwt_required()
def update_location():
    user_id = get_jwt_identity()
    guide = GuideProfile.query.filter_by(user_id=user_id).first()
    if not guide:
        return jsonify({"error": "Guide profile not found"}), 404

    data = request.get_json() or {}
    guide.current_lat = data.get("lat")
    guide.current_lng = data.get("lng")
    guide.location_updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"message": "Location updated"}), 200
