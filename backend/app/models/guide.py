import uuid
from datetime import datetime
from app import db


def gen_uuid():
    return str(uuid.uuid4())


class GuideProfile(db.Model):
    __tablename__ = "guide_profiles"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), unique=True, nullable=False)

    bio = db.Column(db.Text, nullable=True)
    languages = db.Column(db.String(255), nullable=True)  # comma-separated e.g. "English,Swahili,Luhya"
    specialization = db.Column(db.String(120), nullable=True)  # e.g. Birdwatching, Forest trails
    years_experience = db.Column(db.Integer, default=0)
    hourly_rate = db.Column(db.Float, default=0.0)

    certification_url = db.Column(db.String(255), nullable=True)
    is_approved = db.Column(db.Boolean, default=False)  # admin must approve

    is_available = db.Column(db.Boolean, default=False)
    current_lat = db.Column(db.Float, nullable=True)
    current_lng = db.Column(db.Float, nullable=True)
    location_updated_at = db.Column(db.DateTime, nullable=True)

    average_rating = db.Column(db.Float, default=0.0)
    total_reviews = db.Column(db.Integer, default=0)
    total_tours_completed = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="guide_profile")
    bookings = db.relationship("Booking", back_populates="guide")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "bio": self.bio,
            "languages": self.languages.split(",") if self.languages else [],
            "specialization": self.specialization,
            "years_experience": self.years_experience,
            "hourly_rate": self.hourly_rate,
            "certification_url": self.certification_url,
            "is_approved": self.is_approved,
            "is_available": self.is_available,
            "current_lat": self.current_lat,
            "current_lng": self.current_lng,
            "average_rating": self.average_rating,
            "total_reviews": self.total_reviews,
            "total_tours_completed": self.total_tours_completed,
        }
