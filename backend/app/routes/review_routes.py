from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.review import Review
from app.models.review_like import ReviewLike
from app.models.guide import GuideProfile
from app.models.attraction import Attraction
from app.models.booking import Booking, BookingStatus
from app.models.user import User, UserRole
from app.services.notification_service import notify

review_bp = Blueprint("reviews", __name__)


def _recalculate_guide_rating(guide_id):
    guide = GuideProfile.query.get(guide_id)
    if not guide:
        return
    reviews = Review.query.filter_by(guide_id=guide_id).all()
    if reviews:
        guide.average_rating = round(sum(r.rating for r in reviews) / len(reviews), 2)
        guide.total_reviews = len(reviews)
        db.session.commit()


def _recalculate_attraction_rating(attraction_id):
    attraction = Attraction.query.get(attraction_id)
    if not attraction:
        return
    reviews = Review.query.filter_by(attraction_id=attraction_id).all()
    if reviews:
        attraction.average_rating = round(sum(r.rating for r in reviews) / len(reviews), 2)
        attraction.total_reviews = len(reviews)
        db.session.commit()


def _serialize_with_like_state(reviews):
    """
    Attaches "liked_by_me" per review for whoever's asking. Kept out of
    Review.to_dict() itself since that method has no notion of "who's
    viewing this" - it's a plain model serializer, not request-aware.
    """
    current_user_id = get_jwt_identity()
    liked_ids = set()
    if current_user_id and reviews:
        review_ids = [r.id for r in reviews]
        liked_ids = {
            like.review_id
            for like in ReviewLike.query.filter(
                ReviewLike.user_id == current_user_id, ReviewLike.review_id.in_(review_ids)
            ).all()
        }

    results = []
    for r in reviews:
        data = r.to_dict()
        data["liked_by_me"] = r.id in liked_ids
        results.append(data)
    return results


@review_bp.route("/", methods=["POST"])
@jwt_required()
def create_review():
    tourist_id = get_jwt_identity()
    data = request.get_json() or {}

    rating = data.get("rating")
    if not rating or not (1 <= int(rating) <= 5):
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    guide_id = data.get("guide_id")
    booking_id = data.get("booking_id")

    # Guide reviews must be backed by a real, completed trip with that
    # guide - otherwise anyone could review anyone, which defeats the
    # point of reviews on a marketplace like this. Attraction-only reviews
    # (no guide_id) don't require a booking, since a tourist can
    # reasonably visit an attraction without booking a guide through the
    # platform at all.
    if guide_id:
        if not booking_id:
            return jsonify({
                "error": "A completed booking with this guide is required to leave a review"
            }), 400

        booking = Booking.query.get(booking_id)
        if not booking or booking.tourist_id != tourist_id:
            return jsonify({"error": "Booking not found"}), 404
        if booking.guide_id != guide_id:
            return jsonify({"error": "That booking isn't with this guide"}), 400
        if booking.status != BookingStatus.COMPLETED.value:
            return jsonify({"error": "You can only review a guide after your trip is completed"}), 400
        if booking.review is not None:
            return jsonify({"error": "You've already reviewed this booking"}), 409

    review = Review(
        tourist_id=tourist_id,
        booking_id=booking_id,
        guide_id=guide_id,
        attraction_id=data.get("attraction_id"),
        rating=int(rating),
        comment=data.get("comment"),
        photo_urls=",".join(data["photo_urls"]) if data.get("photo_urls") else None,
    )
    db.session.add(review)
    db.session.commit()

    if review.guide_id:
        _recalculate_guide_rating(review.guide_id)
    if review.attraction_id:
        _recalculate_attraction_rating(review.attraction_id)

    if review.guide_id:
        guide = GuideProfile.query.get(review.guide_id)
        reviewer = User.query.get(tourist_id)
        if guide and reviewer:
            stars = "⭐" * int(rating)
            notify(
                guide.user_id,
                title="New review",
                message=f"{reviewer.full_name} left you {stars} ({rating}/5).",
                type="review",
            )

    return jsonify({"review": review.to_dict()}), 201


@review_bp.route("/mine", methods=["GET"])
@jwt_required()
def my_reviews():
    tourist_id = get_jwt_identity()
    reviews = Review.query.filter_by(tourist_id=tourist_id).order_by(Review.created_at.desc()).all()
    return jsonify({"reviews": [r.to_dict() for r in reviews]}), 200


@review_bp.route("/guide/<guide_id>", methods=["GET"])
@jwt_required(optional=True)
def get_guide_reviews(guide_id):
    reviews = Review.query.filter_by(guide_id=guide_id).order_by(Review.created_at.desc()).all()
    return jsonify({"reviews": _serialize_with_like_state(reviews)}), 200


@review_bp.route("/attraction/<attraction_id>", methods=["GET"])
@jwt_required(optional=True)
def get_attraction_reviews(attraction_id):
    reviews = Review.query.filter_by(attraction_id=attraction_id).order_by(Review.created_at.desc()).all()
    return jsonify({"reviews": _serialize_with_like_state(reviews)}), 200


@review_bp.route("/<review_id>/like", methods=["POST"])
@jwt_required()
def toggle_like(review_id):
    user_id = get_jwt_identity()
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"error": "Review not found"}), 404

    existing = ReviewLike.query.filter_by(user_id=user_id, review_id=review_id).first()
    if existing:
        db.session.delete(existing)
        review.likes_count = max(0, (review.likes_count or 0) - 1)
        liked = False
    else:
        db.session.add(ReviewLike(user_id=user_id, review_id=review_id))
        review.likes_count = (review.likes_count or 0) + 1
        liked = True

    db.session.commit()
    return jsonify({"liked": liked, "likes_count": review.likes_count}), 200


@review_bp.route("/<review_id>/report", methods=["POST"])
@jwt_required()
def report_review(review_id):
    """
    Idempotent - flags the review for admin attention. Doesn't hide it
    from public view on a single report (that'd let anyone censor a
    review they don't like); an admin decides via the moderation queue
    whether to delete it or dismiss the report.
    """
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"error": "Review not found"}), 404

    review.is_reported = True
    db.session.commit()
    return jsonify({"message": "Review reported. An admin will take a look."}), 200


@review_bp.route("/<review_id>", methods=["DELETE"])
@jwt_required()
def delete_review(review_id):
    user_id = get_jwt_identity()
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"error": "Review not found"}), 404

    is_owner = review.tourist_id == user_id
    is_admin = False
    if not is_owner:
        requester = User.query.get(user_id)
        is_admin = bool(requester and requester.role == UserRole.ADMIN.value)

    if not (is_owner or is_admin):
        return jsonify({"error": "Not authorized"}), 403

    guide_id, attraction_id = review.guide_id, review.attraction_id
    db.session.delete(review)
    db.session.commit()

    if guide_id:
        _recalculate_guide_rating(guide_id)
    if attraction_id:
        _recalculate_attraction_rating(attraction_id)

    return jsonify({"message": "Review deleted"}), 200
