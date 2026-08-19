import uuid
from datetime import datetime
from app import db


def gen_uuid():
    return str(uuid.uuid4())


class ReviewLike(db.Model):
    """
    One row per (user, review) like. Existence of a row = liked. Deleting
    the row = unliked. This is what makes /reviews/<id>/like a safe toggle
    instead of an unbounded counter anyone could spam - the actual
    Review.likes_count is a denormalized cache kept in sync by the route,
    same pattern as average_rating on GuideProfile/Attraction.
    """
    __tablename__ = "review_likes"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    review_id = db.Column(db.String(36), db.ForeignKey("reviews.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
