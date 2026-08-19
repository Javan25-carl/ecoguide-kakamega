from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_, and_
from app import db
from app.models.message import Message
from app.models.user import User
from app.services.message_service import create_message, MessageValidationError

message_bp = Blueprint("messages", __name__)


@message_bp.route("/conversations", methods=["GET"])
@jwt_required()
def list_conversations():
    """
    One row per person the current user has exchanged messages with,
    with the most recent message and an unread count.
    """
    user_id = get_jwt_identity()
    all_messages = (
        Message.query.filter(or_(Message.sender_id == user_id, Message.receiver_id == user_id))
        .order_by(Message.created_at.desc())
        .all()
    )

    last_message_by_partner = {}
    for m in all_messages:
        partner_id = m.receiver_id if m.sender_id == user_id else m.sender_id
        if partner_id not in last_message_by_partner:
            last_message_by_partner[partner_id] = m

    conversations = []
    for partner_id, last_message in last_message_by_partner.items():
        partner = User.query.get(partner_id)
        if not partner:
            continue
        unread_count = Message.query.filter_by(
            sender_id=partner_id, receiver_id=user_id, is_read=False
        ).count()
        conversations.append({
            "partner": partner.to_dict(),
            "last_message": last_message.to_dict(),
            "unread_count": unread_count,
        })

    conversations.sort(key=lambda c: c["last_message"]["created_at"], reverse=True)
    return jsonify({"conversations": conversations}), 200


@message_bp.route("/thread/<other_user_id>", methods=["GET"])
@jwt_required()
def get_thread(other_user_id):
    user_id = get_jwt_identity()

    other_user = User.query.get(other_user_id)
    if not other_user:
        return jsonify({"error": "User not found"}), 404

    messages = (
        Message.query.filter(
            or_(
                and_(Message.sender_id == user_id, Message.receiver_id == other_user_id),
                and_(Message.sender_id == other_user_id, Message.receiver_id == user_id),
            )
        )
        .order_by(Message.created_at.asc())
        .all()
    )

    # Mark anything the other person sent us as read, since we're viewing the thread
    Message.query.filter_by(sender_id=other_user_id, receiver_id=user_id, is_read=False).update(
        {"is_read": True}
    )
    db.session.commit()

    return jsonify({
        "partner": other_user.to_dict(),
        "messages": [m.to_dict() for m in messages],
    }), 200


@message_bp.route("/", methods=["POST"])
@jwt_required()
def send_message():
    """
    Kept as a REST fallback and for the initial page load path. The chat
    UI itself sends messages over the websocket (see app/sockets.py) so
    the other participant gets it instantly; this endpoint uses the exact
    same validation via create_message so behavior never drifts between
    the two paths.
    """
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    try:
        message = create_message(user_id, data)
    except MessageValidationError as e:
        return jsonify({"error": e.message}), 400

    return jsonify({"sent_message": message.to_dict()}), 201


@message_bp.route("/unread-count", methods=["GET"])
@jwt_required()
def unread_count():
    user_id = get_jwt_identity()
    count = Message.query.filter_by(receiver_id=user_id, is_read=False).count()
    return jsonify({"unread_count": count}), 200
