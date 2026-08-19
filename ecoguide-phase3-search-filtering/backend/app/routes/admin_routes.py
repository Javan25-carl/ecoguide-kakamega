from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_
from sqlalchemy.orm import aliased
from app import db
from app.models.user import User, UserRole
from app.models.guide import GuideProfile
from app.models.booking import Booking, BookingStatus
from app.models.review import Review
from app.models.attraction import Attraction
from app.utils.auth_decorators import admin_required
from app.services.notification_service import notify

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
@admin_required
def get_stats():
    total_users = User.query.filter_by(role=UserRole.TOURIST.value).count()
    total_guides = User.query.filter_by(role=UserRole.GUIDE.value).count()
    pending_guide_approvals = GuideProfile.query.filter_by(is_approved=False).count()

    active_trips = Booking.query.filter_by(status=BookingStatus.ACCEPTED.value).count()
    completed_trips = Booking.query.filter_by(status=BookingStatus.COMPLETED.value).count()
    pending_trips = Booking.query.filter_by(status=BookingStatus.PENDING.value).count()
    rejected_trips = Booking.query.filter_by(status=BookingStatus.REJECTED.value).count()
    cancelled_trips = Booking.query.filter_by(status=BookingStatus.CANCELLED.value).count()

    total_revenue = db.session.query(db.func.sum(Booking.total_price)).filter(
        Booking.status == BookingStatus.COMPLETED.value
    ).scalar() or 0

    return jsonify({
        "total_users": total_users,
        "total_guides": total_guides,
        "pending_guide_approvals": pending_guide_approvals,
        "active_trips": active_trips,
        "completed_trips": completed_trips,
        "pending_trips": pending_trips,
        "rejected_trips": rejected_trips,
        "cancelled_trips": cancelled_trips,
        "total_revenue": total_revenue,
    }), 200


@admin_bp.route("/guides/pending", methods=["GET"])
@jwt_required()
@admin_required
def pending_guides():
    guides = GuideProfile.query.filter_by(is_approved=False).all()
    results = []
    for g in guides:
        data = g.to_dict()
        data["user"] = g.user.to_dict() if g.user else None
        results.append(data)
    return jsonify({"guides": results}), 200


@admin_bp.route("/guides/<guide_id>/approve", methods=["PUT"])
@jwt_required()
@admin_required
def approve_guide(guide_id):
    guide = GuideProfile.query.get(guide_id)
    if not guide:
        return jsonify({"error": "Guide not found"}), 404
    guide.is_approved = True
    db.session.commit()

    notify(
        guide.user_id,
        title="You're approved!",
        message="Your guide profile has been verified. Tourists can now find and book you.",
        type="system",
    )

    return jsonify({"message": "Guide approved", "guide": guide.to_dict()}), 200


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@admin_required
def list_all_users():
    role = request.args.get("role")
    query = User.query
    if role:
        query = query.filter_by(role=role)
    users = query.order_by(User.created_at.desc()).all()
    return jsonify({"users": [u.to_dict() for u in users]}), 200


@admin_bp.route("/users/<user_id>/deactivate", methods=["PUT"])
@jwt_required()
@admin_required
def deactivate_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    user.is_active = False
    db.session.commit()
    return jsonify({"message": "User deactivated"}), 200


@admin_bp.route("/users/<user_id>/activate", methods=["PUT"])
@jwt_required()
@admin_required
def activate_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    user.is_active = True
    db.session.commit()
    return jsonify({"message": "User activated"}), 200


@admin_bp.route("/bookings", methods=["GET"])
@jwt_required()
@admin_required
def list_all_bookings():
    """
    Full booking management view with real server-side search, filtering,
    sorting, and pagination - not the previous status-only filter with a
    flat 200-row cap and client-side slicing.

    Query params (all optional):
      q             - matches booking id, tourist name, guide name, or attraction name
      status        - exact match
      payment_status- exact match
      date_from     - trip_date >= this (YYYY-MM-DD)
      date_to       - trip_date <= this (YYYY-MM-DD)
      guide_id      - exact match
      tourist_id    - exact match
      sort          - newest (default) | oldest | price_high | price_low
      page          - default 1
      per_page      - default 20, capped at 100
    """
    GuideUser = aliased(User)

    query = (
        Booking.query
        .outerjoin(User, Booking.tourist_id == User.id)
        .outerjoin(GuideProfile, Booking.guide_id == GuideProfile.id)
        .outerjoin(GuideUser, GuideProfile.user_id == GuideUser.id)
        .outerjoin(Attraction, Booking.attraction_id == Attraction.id)
    )

    q = request.args.get("q", "").strip()
    if q:
        like = f"%{q}%"
        query = query.filter(or_(
            Booking.id.ilike(like),
            User.full_name.ilike(like),
            GuideUser.full_name.ilike(like),
            Attraction.name.ilike(like),
        ))

    status = request.args.get("status")
    if status:
        query = query.filter(Booking.status == status)

    payment_status = request.args.get("payment_status")
    if payment_status:
        query = query.filter(Booking.payment_status == payment_status)

    date_from = request.args.get("date_from")
    if date_from:
        try:
            query = query.filter(Booking.trip_date >= datetime.strptime(date_from, "%Y-%m-%d").date())
        except ValueError:
            return jsonify({"error": "date_from must be in YYYY-MM-DD format"}), 400

    date_to = request.args.get("date_to")
    if date_to:
        try:
            query = query.filter(Booking.trip_date <= datetime.strptime(date_to, "%Y-%m-%d").date())
        except ValueError:
            return jsonify({"error": "date_to must be in YYYY-MM-DD format"}), 400

    guide_id = request.args.get("guide_id")
    if guide_id:
        query = query.filter(Booking.guide_id == guide_id)

    tourist_id = request.args.get("tourist_id")
    if tourist_id:
        query = query.filter(Booking.tourist_id == tourist_id)

    sort = request.args.get("sort", "newest")
    sort_map = {
        "newest": Booking.created_at.desc(),
        "oldest": Booking.created_at.asc(),
        "price_high": Booking.total_price.desc(),
        "price_low": Booking.total_price.asc(),
    }
    query = query.order_by(sort_map.get(sort, Booking.created_at.desc()))

    page = max(1, request.args.get("page", 1, type=int))
    per_page = min(100, max(1, request.args.get("per_page", 20, type=int)))

    total = query.count()
    bookings = query.offset((page - 1) * per_page).limit(per_page).all()

    results = []
    for b in bookings:
        data = b.to_dict()
        data["tourist_name"] = b.tourist.full_name if b.tourist else None
        data["guide_name"] = b.guide.user.full_name if b.guide and b.guide.user else None
        data["attraction_name"] = b.attraction.name if b.attraction else None
        results.append(data)

    return jsonify({
        "bookings": results,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page if per_page else 1,
    }), 200


@admin_bp.route("/reviews/reported", methods=["GET"])
@jwt_required()
@admin_required
def reported_reviews():
    """Moderation queue - every review that's been flagged, newest first."""
    reviews = Review.query.filter_by(is_reported=True).order_by(Review.created_at.desc()).all()

    results = []
    for r in reviews:
        data = r.to_dict()
        data["tourist_name"] = r.tourist.full_name if r.tourist else None
        if r.guide_id:
            guide = GuideProfile.query.get(r.guide_id)
            data["target_name"] = guide.user.full_name if guide and guide.user else None
            data["target_type"] = "guide"
        elif r.attraction_id:
            attraction = Attraction.query.get(r.attraction_id)
            data["target_name"] = attraction.name if attraction else None
            data["target_type"] = "attraction"
        results.append(data)

    return jsonify({"reviews": results}), 200


@admin_bp.route("/reviews/<review_id>/dismiss", methods=["PUT"])
@jwt_required()
@admin_required
def dismiss_report(review_id):
    """Clears the report flag without deleting - for false-positive reports."""
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"error": "Review not found"}), 404
    review.is_reported = False
    db.session.commit()
    return jsonify({"message": "Report dismissed"}), 200
