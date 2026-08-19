from app import db
from app.models.message import Message
from app.models.user import User


class MessageValidationError(Exception):
    """Raised when a message payload fails validation. Callers translate
    this into whatever response shape fits their transport (JSON error
    body for REST, an 'error' socket event for websockets)."""
    def __init__(self, message):
        super().__init__(message)
        self.message = message


def create_message(sender_id, data):
    """
    data: dict with receiver_id, and optionally content/image_url/
    shared_lat/shared_lng. Returns the created Message on success,
    raises MessageValidationError otherwise.
    """
    receiver_id = data.get("receiver_id")
    if not receiver_id:
        raise MessageValidationError("receiver_id is required")
    if receiver_id == sender_id:
        raise MessageValidationError("Can't message yourself")

    has_content = bool(data.get("content"))
    has_image = bool(data.get("image_url"))
    has_location = data.get("shared_lat") is not None and data.get("shared_lng") is not None
    if not (has_content or has_image or has_location):
        raise MessageValidationError("Message must include text, an image, or a location")

    receiver = User.query.get(receiver_id)
    if not receiver:
        raise MessageValidationError("Recipient not found")

    message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=data.get("content"),
        image_url=data.get("image_url"),
        shared_lat=data.get("shared_lat"),
        shared_lng=data.get("shared_lng"),
    )
    db.session.add(message)
    db.session.commit()
    return message
