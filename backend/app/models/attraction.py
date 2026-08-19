import uuid
from datetime import datetime
from app import db


def gen_uuid():
    return str(uuid.uuid4())


class Attraction(db.Model):
    __tablename__ = "attractions"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    history = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(80), nullable=True)  # e.g. Forest, Waterfall, Cultural site

    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)

    entrance_fee = db.Column(db.Float, default=0.0)
    opening_hours = db.Column(db.String(100), nullable=True)
    best_time_to_visit = db.Column(db.String(150), nullable=True)

    cover_image_url = db.Column(db.String(255), nullable=True)
    gallery_urls = db.Column(db.Text, nullable=True)  # comma-separated URLs

    average_rating = db.Column(db.Float, default=0.0)
    total_reviews = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "history": self.history,
            "category": self.category,
            "lat": self.lat,
            "lng": self.lng,
            "entrance_fee": self.entrance_fee,
            "opening_hours": self.opening_hours,
            "best_time_to_visit": self.best_time_to_visit,
            "cover_image_url": self.cover_image_url,
            "gallery_urls": self.gallery_urls.split(",") if self.gallery_urls else [],
            "average_rating": self.average_rating,
            "total_reviews": self.total_reviews,
        }
