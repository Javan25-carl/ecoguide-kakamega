import uuid
from datetime import datetime
from enum import Enum
from app import db


def gen_uuid():
    return str(uuid.uuid4())


class BookingStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class PaymentStatus(str, Enum):
    UNPAID = "unpaid"
    PAID = "paid"


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)

    tourist_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    guide_id = db.Column(db.String(36), db.ForeignKey("guide_profiles.id"), nullable=False)
    attraction_id = db.Column(db.String(36), db.ForeignKey("attractions.id"), nullable=True)

    trip_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=True)
    duration_hours = db.Column(db.Float, default=2.0)
    number_of_people = db.Column(db.Integer, default=1)

    status = db.Column(db.String(20), default=BookingStatus.PENDING.value)
    payment_status = db.Column(db.String(20), default=PaymentStatus.UNPAID.value)
    rejection_reason = db.Column(db.Text, nullable=True)

    total_price = db.Column(db.Float, default=0.0)
    notes = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tourist = db.relationship("User", back_populates="bookings_made", foreign_keys=[tourist_id])
    guide = db.relationship("GuideProfile", back_populates="bookings")
    attraction = db.relationship("Attraction")
    review = db.relationship("Review", back_populates="booking", uselist=False)
    status_history = db.relationship(
        "BookingStatusHistory", back_populates="booking",
        order_by="BookingStatusHistory.created_at", cascade="all, delete-orphan"
    )

    def price_breakdown(self):
        """
        Guides are paid for their time, not per head - the group size is
        informational (helps the guide plan), not a price multiplier.
        Kept as an explicit method (not just a raw number) so the frontend
        can render a real breakdown instead of guessing at one.
        """
        rate = self.guide.hourly_rate if self.guide else 0
        subtotal = round((rate or 0) * (self.duration_hours or 0), 2)
        return {
            "guide_hourly_rate": rate,
            "duration_hours": self.duration_hours,
            "subtotal": subtotal,
            "discount": 0,
            "total": subtotal,
        }

    def to_dict(self, include_breakdown=False):
        data = {
            "id": self.id,
            "tourist_id": self.tourist_id,
            "guide_id": self.guide_id,
            "attraction_id": self.attraction_id,
            "trip_date": self.trip_date.isoformat() if self.trip_date else None,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "duration_hours": self.duration_hours,
            "number_of_people": self.number_of_people,
            "status": self.status,
            "payment_status": self.payment_status,
            "rejection_reason": self.rejection_reason,
            "total_price": self.total_price,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_breakdown:
            data["price_breakdown"] = self.price_breakdown()
            data["status_history"] = [h.to_dict() for h in self.status_history]
        return data


class BookingStatusHistory(db.Model):
    """
    One row per status transition. This is what makes the booking timeline
    on the frontend real instead of guessed - without this table, "Guide
    Accepted" and "Trip Completed" would just be inferred from the current
    status with no actual timestamp for when each step happened.
    """
    __tablename__ = "booking_status_history"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    booking_id = db.Column(db.String(36), db.ForeignKey("bookings.id"), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    note = db.Column(db.Text, nullable=True)
    changed_by_user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    booking = db.relationship("Booking", back_populates="status_history")

    def to_dict(self):
        return {
            "id": self.id,
            "status": self.status,
            "note": self.note,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
