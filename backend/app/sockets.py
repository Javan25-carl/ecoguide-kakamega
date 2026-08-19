"""
Socket.IO event handlers for real-time chat.

Design notes:
- Auth happens on connect via a JWT access token passed in the client's
  `auth` payload (not a header - the socket handshake doesn't carry
  Authorization headers the way axios requests do).
- Each connected user joins a room named f"user:{user_id}". Sending a
  message emits directly to the receiver's room (and back to the sender's
  own room, so their other open tabs/devices stay in sync) rather than
  broadcasting to everyone.
- Presence (online/offline) is tracked in-memory as {user_id: set(sids)}.
  This is per-process state: fine for the single-worker dev/demo setup
  this project runs on, but won't work correctly if you scale to multiple
  gunicorn workers or containers without a shared backing store (Redis,
  via flask-socketio's message_queue option). Documented in the README.
"""
from flask import request
from flask_jwt_extended import decode_token
from flask_socketio import join_room, emit, disconnect

from app import socketio, db
from app.models.message import Message
from app.services.message_service import create_message, MessageValidationError

# user_id -> set of socket session ids (a user can have multiple tabs/devices open)
_online_users = {}


def user_room(user_id):
    return f"user:{user_id}"


def _authenticate(auth):
    """Returns a user_id if the token is valid, else None."""
    token = (auth or {}).get("token")
    if not token:
        return None
    try:
        decoded = decode_token(token)
        return decoded.get("sub")
    except Exception:
        return None


@socketio.on("connect")
def handle_connect(auth):
    user_id = _authenticate(auth)
    if not user_id:
        return False  # reject the connection

    request.environ["user_id"] = user_id  # stash for this connection's lifetime

    was_offline = user_id not in _online_users or len(_online_users[user_id]) == 0
    _online_users.setdefault(user_id, set()).add(request.sid)
    join_room(user_room(user_id))

    if was_offline:
        emit("presence", {"user_id": user_id, "online": True}, broadcast=True, include_self=False)

    return True


@socketio.on("disconnect")
def handle_disconnect():
    user_id = request.environ.get("user_id")
    if not user_id:
        return

    sids = _online_users.get(user_id)
    if sids:
        sids.discard(request.sid)
        if not sids:
            del _online_users[user_id]
            emit("presence", {"user_id": user_id, "online": False}, broadcast=True, include_self=False)


@socketio.on("send_message")
def handle_send_message(data):
    user_id = request.environ.get("user_id")
    if not user_id:
        return disconnect()

    try:
        message = create_message(user_id, data or {})
    except MessageValidationError as e:
        emit("error", {"error": e.message})
        return

    payload = message.to_dict()
    emit("new_message", payload, room=user_room(message.receiver_id))
    emit("new_message", payload, room=user_room(message.sender_id))


@socketio.on("typing")
def handle_typing(data):
    user_id = request.environ.get("user_id")
    if not user_id:
        return

    receiver_id = (data or {}).get("receiver_id")
    is_typing = bool((data or {}).get("is_typing"))
    if not receiver_id:
        return

    emit("typing", {"sender_id": user_id, "is_typing": is_typing}, room=user_room(receiver_id))


@socketio.on("mark_read")
def handle_mark_read(data):
    user_id = request.environ.get("user_id")
    if not user_id:
        return

    other_user_id = (data or {}).get("other_user_id")
    if not other_user_id:
        return

    Message.query.filter_by(sender_id=other_user_id, receiver_id=user_id, is_read=False).update(
        {"is_read": True}
    )
    db.session.commit()

    emit("read_receipt", {"reader_id": user_id}, room=user_room(other_user_id))


@socketio.on("who_is_online")
def handle_who_is_online(data):
    """
    A client asks 'of these user ids, which are currently online' -
    used to seed presence dots when a conversation list first loads,
    since the broadcast presence events only cover changes after connect.
    """
    user_ids = (data or {}).get("user_ids") or []
    online = [uid for uid in user_ids if uid in _online_users]
    emit("online_list", {"user_ids": online})
