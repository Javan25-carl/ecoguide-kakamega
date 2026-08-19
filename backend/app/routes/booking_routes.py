from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.booking import Booking, BookingStatus, PaymentStatus, BookingStatusHistory
from app.models.guide import GuideProfile
from app.models.user import User, UserRole
from app.services.notification_service import notify

booking_bp = Blueprint("bookings", __name__)

# Tourist cancellation policy for an already-accepted booking: must cancel
# at least this many hours before the trip starts. Pending bookings (not
# yet accepted by a guide) can always be cancelled with no notice period -
# nothing's been committed to yet. This is a real, enforced rule (backend
# checks it, not just a frontend hint) rather than the previous
# unconditional "any pending/accepted booking can be cancelled" behavior.
CANCELLATION_NOTICE_HOURS = 24


def _price_for(guide, duration_hours):
    return round((guide.hourly_rate or 0) * duration_hours, 2)


def _log_status(booking, status, user_id=None, note=None):
    db.session.add(BookingStatusHistory(
        booking_id=booking.id, status=status, changed_by_user_id=user_id, note=note
    ))


def _trip_datetime(booking):
    """Combines trip_date + start_time into one comparable datetime. Falls
    back to midnight on trip_date if no start_time was given, which is the
    conservative (more restrictive) choice for the cancellation window."""
    if not booking.trip_date:
        return None
    time_part = booking.start_time or datetime.min.time()
    return datetime.combine(booking.trip_date, time_part)


def _serialize_list(bookings):
    return [b.to_dict() for b in bookings]


@booking_bp.route("/reviewable/<guide_id>", methods=["GET"])
@jwt_required()
def reviewable_bookings(guide_id):
    tourist_id = get_jwt_identity()
    bookings = (
        Booking.query.filter_by(tourist_id=tourist_id, guide_id=guide_id, status=BookingStatus.COMPLETED.value)
        .order_by(Booking.trip_date.desc())
        .all()
    )
    eligible = [b for b in bookings if b.review is None]
    return jsonify({"bookings": _serialize_list(eligible)}), 200


@booking_bp.route("/", methods=["POST"])
@jwt_required()
def create_booking():
    tourist_id = get_jwt_identity()
    data = request.get_json() or {}

    required = ["guide_id", "trip_date"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    guide = GuideProfile.query.get(data["guide_id"])
    if not guide:
        return jsonify({"error": "Guide not found"}), 404
    if not guide.is_approved:
        return jsonify({"error": "This guide isn't available for booking yet"}), 400

    try:
        trip_date = datetime.strptime(data["trip_date"], "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "trip_date must be in YYYY-MM-DD format"}), 400

    start_time = None
    if data.get("start_time"):
        try:
            start_time = datetime.strptime(data["start_time"], "%H:%M").time()
        except ValueError:
            return jsonify({"error": "start_time must be in HH:MM format"}), 400

    duration = float(data.get("duration_hours", 2))
    if duration <= 0:
        return jsonify({"error": "duration_hours must be greater than 0"}), 400

    number_of_people = int(data.get("number_of_people", 1))
    if number_of_people < 1:
        return jsonify({"error": "number_of_people must be at least 1"}), 400

    # Price is always computed server-side from the guide's current rate -
    # never trust a price the client might send.
    booking = Booking(
        tourist_id=tourist_id,
        guide_id=guide.id,
        attraction_id=data.get("attraction_id"),
        trip_date=trip_date,
        start_time=start_time,
        duration_hours=duration,
        number_of_people=number_of_people,
        notes=data.get("notes"),
        total_price=_price_for(guide, duration),
        status=BookingStatus.PENDING.value,
        payment_status=PaymentStatus.UNPAID.value,
    )
    db.session.add(booking)
    db.session.flush()  # booking.id needed for the history row
    _log_status(booking, BookingStatus.PENDING.value, user_id=tourist_id, note="Booking requested")
    db.session.commit()

    if guide.user_id:
        notify(
            guide.user_id, "New booking request",
            f"A tourist requested a trip on {trip_date.isoformat()}", type="booking"
        )

    return jsonify({"booking": booking.to_dict(include_breakdown=True)}), 201


@booking_bp.route("/my", methods=["GET"])
@jwt_required()
def my_bookings():
    tourist_id = get_jwt_identity()
    bookings = Booking.query.filter_by(tourist_id=tourist_id).order_by(Booking.trip_date.desc()).all()

    results = []
    for b in bookings:
        data = b.to_dict()
        data["guide_name"] = b.guide.user.full_name if b.guide and b.guide.user else None
        data["attraction_name"] = b.attraction.name if b.attraction else None
        results.append(data)
    return jsonify({"bookings": results}), 200


@booking_bp.route("/<booking_id>", methods=["GET"])
@jwt_required()
def get_booking(booking_id):
    user_id = get_jwt_identity()
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    requester = User.query.get(user_id)
    is_tourist = booking.tourist_id == user_id
    is_guide = booking.guide and booking.guide.user_id == user_id
    is_admin = bool(requester and requester.role == UserRole.ADMIN.value)
    if not (is_tourist or is_guide or is_admin):
        return jsonify({"error": "Not authorized to view this booking"}), 403

    data = booking.to_dict(include_breakdown=True)
    data["guide_name"] = booking.guide.user.full_name if booking.guide and booking.guide.user else None
    data["tourist_name"] = booking.tourist.full_name if booking.tourist else None
    data["attraction_name"] = booking.attraction.name if booking.attraction else None
    return jsonify({"booking": data}), 200


@booking_bp.route("/guide/incoming", methods=["GET"])
@jwt_required()
def guide_incoming_bookings():
    user_id = get_jwt_identity()
    guide = GuideProfile.query.filter_by(user_id=user_id).first()
    if not guide:
        return jsonify({"error": "Guide profile not found"}), 404

    bookings = Booking.query.filter_by(guide_id=guide.id).order_by(Booking.trip_date.desc()).all()
    results = []
    for b in bookings:
        data = b.to_dict()
        data["tourist_name"] = b.tourist.full_name if b.tourist else None
        data["attraction_name"] = b.attraction.name if b.attraction else None
        results.append(data)
    return jsonify({"bookings": results}), 200


@booking_bp.route("/<booking_id>", methods=["PUT"])
@jwt_required()
def reschedule_booking(booking_id):
    user_id = get_jwt_identity()
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.tourist_id != user_id:
        return jsonify({"error": "Only the tourist who made this booking can reschedule it"}), 403

    if booking.status != BookingStatus.PENDING.value:
        return jsonify({"error": f"Can't reschedule a booking that is already {booking.status}"}), 400

    data = request.get_json() or {}
    changed = []

    if "trip_date" in data:
        try:
            booking.trip_date = datetime.strptime(data["trip_date"], "%Y-%m-%d").date()
            changed.append("date")
        except ValueError:
            return jsonify({"error": "trip_date must be in YYYY-MM-DD format"}), 400

    if "start_time" in data and data["start_time"]:
        try:
            booking.start_time = datetime.strptime(data["start_time"], "%H:%M").time()
            changed.append("time")
        except ValueError:
            return jsonify({"error": "start_time must be in HH:MM format"}), 400

    if "duration_hours" in data:
        duration = float(data["duration_hours"])
        if duration <= 0:
            return jsonify({"error": "duration_hours must be greater than 0"}), 400
        booking.duration_hours = duration
        booking.total_price = _price_for(booking.guide, duration)
        changed.append("duration")

    if "number_of_people" in data:
        booking.number_of_people = data["number_of_people"]

    if "notes" in data:
        booking.notes = data["notes"]

    if changed:
        _log_status(booking, booking.status, user_id=user_id, note=f"Rescheduled ({', '.join(changed)})")

    db.session.commit()
    return jsonify({"booking": booking.to_dict(include_breakdown=True)}), 200


@booking_bp.route("/<booking_id>/status", methods=["PUT"])
@jwt_required()
def update_booking_status(booking_id):
    """
    Expected body: { "status": "accepted" | "rejected" | "cancelled" | "completed", "reason": "..." (optional, used for rejections) }

    Authorization rules:
      - accepted / rejected / completed -> only the guide on this booking
      - cancelled                        -> either the tourist or the guide,
                                             subject to the cancellation policy below
    """
    user_id = get_jwt_identity()
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    data = request.get_json() or {}
    new_status = data.get("status")
    valid_statuses = [s.value for s in BookingStatus]
    if new_status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of {valid_statuses}"}), 400

    is_tourist = booking.tourist_id == user_id
    is_guide = booking.guide and booking.guide.user_id == user_id

    TERMINAL = (BookingStatus.COMPLETED.value, BookingStatus.REJECTED.value, BookingStatus.CANCELLED.value)
    if booking.status in TERMINAL:
        return jsonify({"error": f"This booking is already {booking.status} and can't be changed"}), 400

    if new_status in (BookingStatus.ACCEPTED.value, BookingStatus.REJECTED.value, BookingStatus.COMPLETED.value):
        if not is_guide:
            return jsonify({"error": "Only the assigned guide can do that"}), 403
        if new_status == BookingStatus.COMPLETED.value and booking.status != BookingStatus.ACCEPTED.value:
            return jsonify({"error": "Only an accepted booking can be marked completed"}), 400

    elif new_status == BookingStatus.CANCELLED.value:
        if not (is_tourist or is_guide):
            return jsonify({"error": "Not authorized to cancel this booking"}), 403

        # Enforce the real cancellation policy - pending bookings (nothing
        # confirmed yet) can always be cancelled; an already-accepted
        # booking needs advance notice from the tourist side.
        if is_tourist and booking.status == BookingStatus.ACCEPTED.value:
            trip_dt = _trip_datetime(booking)
            if trip_dt and trip_dt - datetime.utcnow() < timedelta(hours=CANCELLATION_NOTICE_HOURS):
                return jsonify({
                    "error": f"Accepted trips can only be cancelled at least {CANCELLATION_NOTICE_HOURS} hours in advance"
                }), 400
    else:
        return jsonify({"error": "Unsupported status transition"}), 400

    booking.status = new_status
    if new_status == BookingStatus.REJECTED.value and data.get("reason"):
        booking.rejection_reason = data["reason"]

    note = data.get("reason") if new_status == BookingStatus.REJECTED.value else None
    _log_status(booking, new_status, user_id=user_id, note=note)

    if new_status == BookingStatus.COMPLETED.value:
        booking.guide.total_tours_completed = (booking.guide.total_tours_completed or 0) + 1

    db.session.commit()

    # Notifications
    if new_status == BookingStatus.ACCEPTED.value:
        notify(booking.tourist_id, "Booking accepted",
               f"Your guide accepted your trip on {booking.trip_date.isoformat()}", type="booking")
    elif new_status == BookingStatus.REJECTED.value:
        notify(booking.tourist_id, "Booking declined",
               booking.rejection_reason or "Your guide couldn't take this trip.", type="booking")
    elif new_status == BookingStatus.COMPLETED.value:
        notify(booking.tourist_id, "Trip completed",
               "Your trip is complete - leave a review for your guide!", type="booking")
    elif new_status == BookingStatus.CANCELLED.value:
        if is_tourist and booking.guide and booking.guide.user_id:
            notify(booking.guide.user_id, "Booking cancelled",
                   f"A tourist cancelled their trip on {booking.trip_date.isoformat()}", type="booking")
        elif is_guide:
            notify(booking.tourist_id, "Booking cancelled",
                   "Your guide cancelled this trip.", type="booking")

    return jsonify({"booking": booking.to_dict(include_breakdown=True)}), 200


@booking_bp.route("/<booking_id>/payment-status", methods=["PUT"])
@jwt_required()
def update_payment_status(booking_id):
    """
    Manually tracked, not processed - there's no payment gateway wired up
    yet (see README). This lets a guide or admin mark a booking paid once
    they've actually been paid outside the app (cash, M-Pesa, etc.), so
    the UI can show accurate payment badges rather than a field that never
    changes from its default.
    """
    user_id = get_jwt_identity()
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    requester = User.query.get(user_id)
    is_guide = booking.guide and booking.guide.user_id == user_id
    is_admin = bool(requester and requester.role == UserRole.ADMIN.value)
    if not (is_guide or is_admin):
        return jsonify({"error": "Only the guide or an admin can update payment status"}), 403

    data = request.get_json() or {}
    new_payment_status = data.get("payment_status")
    valid = [s.value for s in PaymentStatus]
    if new_payment_status not in valid:
        return jsonify({"error": f"payment_status must be one of {valid}"}), 400

    booking.payment_status = new_payment_status
    db.session.commit()

    if new_payment_status == PaymentStatus.PAID.value:
        notify(booking.tourist_id, "Payment confirmed", "Your payment has been confirmed.", type="booking")

    return jsonify({"booking": booking.to_dict()}), 200
