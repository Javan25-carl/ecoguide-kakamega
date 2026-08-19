import uuid
from datetime import datetime
from app import db


def gen_uuid():
    return str(uuid.uuid4())


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    sender_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    receiver_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)

    content = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(255), nullable=True)
    shared_lat = db.Column(db.Float, nullable=True)
    shared_lng = db.Column(db.Float, nullable=True)

    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "content": self.content,
            "image_url": self.image_url,
            "shared_lat": self.shared_lat,
            "shared_lng": self.shared_lng,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
