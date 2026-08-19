import uuid
from datetime import datetime
from app import db


def gen_uuid():
    return str(uuid.uuid4())


class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)

    booking_id = db.Column(db.String(36), db.ForeignKey("bookings.id"), unique=True, nullable=True)
    tourist_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    guide_id = db.Column(db.String(36), db.ForeignKey("guide_profiles.id"), nullable=True)
    attraction_id = db.Column(db.String(36), db.ForeignKey("attractions.id"), nullable=True)

    rating = db.Column(db.Integer, nullable=False)  # 1-5
    comment = db.Column(db.Text, nullable=True)
    photo_urls = db.Column(db.Text, nullable=True)  # comma-separated

    likes_count = db.Column(db.Integer, default=0)
    is_reported = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    booking = db.relationship("Booking", back_populates="review")
    tourist = db.relationship("User", back_populates="reviews_written")

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "tourist_id": self.tourist_id,
            "guide_id": self.guide_id,
            "attraction_id": self.attraction_id,
            "rating": self.rating,
            "comment": self.comment,
            "photo_urls": self.photo_urls.split(",") if self.photo_urls else [],
            "likes_count": self.likes_count,
            "is_reported": self.is_reported,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
