from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.attraction import Attraction
from app.models.booking import Booking
from app.models.review import Review
from app.models.favorite import Favorite
from app.utils.auth_decorators import admin_required

attraction_bp = Blueprint("attractions", __name__)


@attraction_bp.route("/", methods=["GET"])
def list_attractions():
    query = Attraction.query
    category = request.args.get("category")
    if category:
        query = query.filter_by(category=category)

    search = request.args.get("q")
    if search:
        query = query.filter(Attraction.name.ilike(f"%{search}%"))

    attractions = query.order_by(Attraction.created_at.desc()).all()
    return jsonify({"attractions": [a.to_dict() for a in attractions]}), 200


@attraction_bp.route("/<attraction_id>", methods=["GET"])
def get_attraction(attraction_id):
    attraction = Attraction.query.get(attraction_id)
    if not attraction:
        return jsonify({"error": "Attraction not found"}), 404
    return jsonify({"attraction": attraction.to_dict()}), 200


def _apply_fields(attraction, data):
    for field in [
        "name", "description", "history", "category",
        "entrance_fee", "opening_hours", "best_time_to_visit", "cover_image_url",
    ]:
        if field in data:
            setattr(attraction, field, data[field])

    if "lat" in data:
        attraction.lat = data["lat"]
    if "lng" in data:
        attraction.lng = data["lng"]
    if "gallery_urls" in data and isinstance(data["gallery_urls"], list):
        attraction.gallery_urls = ",".join(data["gallery_urls"])


@attraction_bp.route("/", methods=["POST"])
@jwt_required()
@admin_required
def create_attraction():
    data = request.get_json() or {}
    required = ["name", "description", "lat", "lng"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    attraction = Attraction(name=data["name"], description=data["description"], lat=data["lat"], lng=data["lng"])
    _apply_fields(attraction, data)
    db.session.add(attraction)
    db.session.commit()
    return jsonify({"attraction": attraction.to_dict()}), 201


@attraction_bp.route("/<attraction_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_attraction(attraction_id):
    attraction = Attraction.query.get(attraction_id)
    if not attraction:
        return jsonify({"error": "Attraction not found"}), 404

    data = request.get_json() or {}
    _apply_fields(attraction, data)
    db.session.commit()
    return jsonify({"attraction": attraction.to_dict()}), 200


@attraction_bp.route("/<attraction_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_attraction(attraction_id):
    attraction = Attraction.query.get(attraction_id)
    if not attraction:
        return jsonify({"error": "Attraction not found"}), 404

    booking_count = Booking.query.filter_by(attraction_id=attraction_id).count()
    if booking_count > 0:
        return jsonify({
            "error": f"Can't delete - {booking_count} booking(s) reference this attraction. "
                     "Those trips need to be resolved first."
        }), 409

    # Reviews and favorites aren't blocking, but do need cleanup to avoid
    # leaving dangling foreign keys (SQLite won't complain in dev, Postgres will).
    Review.query.filter_by(attraction_id=attraction_id).delete()
    Favorite.query.filter_by(attraction_id=attraction_id).delete()

    db.session.delete(attraction)
    db.session.commit()
    return jsonify({"message": "Attraction deleted"}), 200
