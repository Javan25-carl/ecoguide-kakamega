from app import db, socketio
from app.models.notification import Notification
from app.sockets import user_room


def notify(user_id, title, message=None, type="general"):
    """
    Creates a Notification row and pushes it to the user's socket room in
    the same call, so it shows up live if they're connected (chat-style)
    and is still there via GET /notifications/ if they're not.

    type: "booking" | "review" | "system" | "message" | "general" -
    matches the values the frontend's notification icon/styling switches on.
    """
    if not user_id:
        return None

    notification = Notification(user_id=user_id, title=title, message=message, type=type)
    db.session.add(notification)
    db.session.commit()

    socketio.emit("new_notification", notification.to_dict(), room=user_room(user_id))

    return notification
