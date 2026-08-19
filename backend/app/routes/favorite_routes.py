from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.favorite import Favorite
from app.models.guide import GuideProfile
from app.models.attraction import Attraction

favorite_bp = Blueprint("favorites", __name__)


@favorite_bp.route("/", methods=["GET"])
@jwt_required()
def list_favorites():
    user_id = get_jwt_identity()
    favorites = Favorite.query.filter_by(user_id=user_id).order_by(Favorite.created_at.desc()).all()
    return jsonify({"favorites": [f.to_dict() for f in favorites]}), 200


@favorite_bp.route("/guides/<guide_id>", methods=["POST"])
@jwt_required()
def favorite_guide(guide_id):
    user_id = get_jwt_identity()

    guide = GuideProfile.query.get(guide_id)
    if not guide:
        return jsonify({"error": "Guide not found"}), 404

    existing = Favorite.query.filter_by(user_id=user_id, guide_id=guide_id).first()
    if existing:
        return jsonify({"favorite": existing.to_dict()}), 200

    favorite = Favorite(user_id=user_id, guide_id=guide_id)
    db.session.add(favorite)
    db.session.commit()
    return jsonify({"favorite": favorite.to_dict()}), 201


@favorite_bp.route("/guides/<guide_id>", methods=["DELETE"])
@jwt_required()
def unfavorite_guide(guide_id):
    user_id = get_jwt_identity()
    favorite = Favorite.query.filter_by(user_id=user_id, guide_id=guide_id).first()
    if favorite:
        db.session.delete(favorite)
        db.session.commit()
    return jsonify({"message": "Removed from favorites"}), 200


@favorite_bp.route("/attractions/<attraction_id>", methods=["POST"])
@jwt_required()
def favorite_attraction(attraction_id):
    user_id = get_jwt_identity()

    attraction = Attraction.query.get(attraction_id)
    if not attraction:
        return jsonify({"error": "Attraction not found"}), 404

    existing = Favorite.query.filter_by(user_id=user_id, attraction_id=attraction_id).first()
    if existing:
        return jsonify({"favorite": existing.to_dict()}), 200

    favorite = Favorite(user_id=user_id, attraction_id=attraction_id)
    db.session.add(favorite)
    db.session.commit()
    return jsonify({"favorite": favorite.to_dict()}), 201


@favorite_bp.route("/attractions/<attraction_id>", methods=["DELETE"])
@jwt_required()
def unfavorite_attraction(attraction_id):
    user_id = get_jwt_identity()
    favorite = Favorite.query.filter_by(user_id=user_id, attraction_id=attraction_id).first()
    if favorite:
        db.session.delete(favorite)
        db.session.commit()
    return jsonify({"message": "Removed from favorites"}), 200


@favorite_bp.route("/status", methods=["GET"])
@jwt_required()
def favorite_status():
    """
    Bulk-check which guide/attraction ids (from query params) are already
    favorited by the current user, so list pages can render filled hearts
    without an extra request per card.
    ?guide_ids=1,2,3&attraction_ids=4,5
    """
    user_id = get_jwt_identity()
    guide_ids = [g for g in (request.args.get("guide_ids") or "").split(",") if g]
    attraction_ids = [a for a in (request.args.get("attraction_ids") or "").split(",") if a]

    favorited_guides = set()
    favorited_attractions = set()

    if guide_ids:
        rows = Favorite.query.filter(Favorite.user_id == user_id, Favorite.guide_id.in_(guide_ids)).all()
        favorited_guides = {r.guide_id for r in rows}

    if attraction_ids:
        rows = Favorite.query.filter(
            Favorite.user_id == user_id, Favorite.attraction_id.in_(attraction_ids)
        ).all()
        favorited_attractions = {r.attraction_id for r in rows}

    return jsonify({
        "guide_ids": list(favorited_guides),
        "attraction_ids": list(favorited_attractions),
    }), 200
