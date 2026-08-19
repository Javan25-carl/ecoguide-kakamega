import uuid
from datetime import datetime
from app import db


def gen_uuid():
    return str(uuid.uuid4())


class Favorite(db.Model):
    """
    A tourist's saved guide or saved attraction. Exactly one of
    guide_id / attraction_id should be set per row - enforced in the
    route layer rather than a DB constraint, to stay portable across
    SQLite (dev) and Postgres (prod).
    """
    __tablename__ = "favorites"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    guide_id = db.Column(db.String(36), db.ForeignKey("guide_profiles.id"), nullable=True)
    attraction_id = db.Column(db.String(36), db.ForeignKey("attractions.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User")
    guide = db.relationship("GuideProfile")
    attraction = db.relationship("Attraction")

    def to_dict(self):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if self.guide_id:
            data["type"] = "guide"
            data["guide"] = self.guide.to_dict() if self.guide else None
            if self.guide and self.guide.user:
                data["guide"]["user"] = self.guide.user.to_dict()
        elif self.attraction_id:
            data["type"] = "attraction"
            data["attraction"] = self.attraction.to_dict() if self.attraction else None
        return data
