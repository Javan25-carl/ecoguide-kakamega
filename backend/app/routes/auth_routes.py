from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from app import db
from app.models.user import User, UserRole
from app.models.guide import GuideProfile

auth_bp = Blueprint("auth", __name__)

RESET_SALT = "password-reset-salt"
RESET_MAX_AGE_SECONDS = 3600  # 1 hour

VERIFY_SALT = "email-verification-salt"
VERIFY_MAX_AGE_SECONDS = 60 * 60 * 24  # 24 hours - lower stakes than a
# password reset token (it only flips is_verified, not account access),
# so a longer window before someone has to request a fresh link is fine.


def _serializer():
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"])


def _send_verification_email(user):
    """
    No email service is configured yet (see MAIL_* settings in .env). For
    local development this logs the verification link and returns the
    token directly in DEBUG mode, mirroring the forgot-password pattern
    below, so the flow is fully testable without SMTP set up.
    """
    token = _serializer().dumps(user.email, salt=VERIFY_SALT)
    verify_link = f"http://localhost:5173/verify-email?token={token}"
    current_app.logger.info(f"Verification link for {user.email}: {verify_link}")
    return token


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    required = ["full_name", "email", "password", "role"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    if data["role"] not in [r.value for r in UserRole]:
        return jsonify({"error": "Invalid role"}), 400

    if User.query.filter_by(email=data["email"].lower().strip()).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(
        full_name=data["full_name"].strip(),
        email=data["email"].lower().strip(),
        phone=data.get("phone"),
        role=data["role"],
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.flush()  # get user.id before commit

    # If registering as a guide, create an empty guide profile awaiting approval
    if user.role == UserRole.GUIDE.value:
        guide_profile = GuideProfile(user_id=user.id)
        db.session.add(guide_profile)

    db.session.commit()

    dev_verification_token = _send_verification_email(user)

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)

    response = {
        "message": "Registration successful",
        "user": user.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }
    if current_app.config.get("DEBUG"):
        response["dev_verification_token"] = dev_verification_token

    return jsonify(response), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").lower().strip()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    if not user.is_active:
        return jsonify({"error": "Account is deactivated. Contact support."}), 403

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)

    return jsonify({
        "message": "Login successful",
        "user": user.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    new_token = create_access_token(identity=identity)
    return jsonify({"access_token": new_token}), 200


@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"error": "current_password and new_password are required"}), 400
    if len(new_password) < 8:
        return jsonify({"error": "New password must be at least 8 characters"}), 400
    if not user.check_password(current_password):
        return jsonify({"error": "Current password is incorrect"}), 401

    user.set_password(new_password)
    db.session.commit()
    return jsonify({"message": "Password updated"}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = (data.get("email") or "").lower().strip()
    user = User.query.filter_by(email=email).first()

    # Always return the same generic message so we never reveal whether
    # an email is registered.
    generic_response = {
        "message": "If an account exists for that email, a reset link has been sent."
    }

    if not user:
        return jsonify(generic_response), 200

    token = _serializer().dumps(user.email, salt=RESET_SALT)

    # No email service is configured yet (see MAIL_* settings in .env).
    # For local development we log the reset link and echo the token back
    # so the flow is testable end-to-end without SMTP set up.
    reset_link = f"http://localhost:5173/reset-password?token={token}"
    current_app.logger.info(f"Password reset link for {user.email}: {reset_link}")

    if current_app.config.get("DEBUG"):
        generic_response["dev_reset_token"] = token

    return jsonify(generic_response), 200


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json() or {}
    token = data.get("token")
    new_password = data.get("password")

    if not token or not new_password:
        return jsonify({"error": "Token and new password are required"}), 400
    if len(new_password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    try:
        email = _serializer().loads(token, salt=RESET_SALT, max_age=RESET_MAX_AGE_SECONDS)
    except SignatureExpired:
        return jsonify({"error": "This reset link has expired. Request a new one."}), 400
    except BadSignature:
        return jsonify({"error": "This reset link is invalid."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.set_password(new_password)
    db.session.commit()
    return jsonify({"message": "Password updated. You can now log in."}), 200


@auth_bp.route("/verify-email", methods=["POST"])
def verify_email():
    data = request.get_json() or {}
    token = data.get("token")
    if not token:
        return jsonify({"error": "Token is required"}), 400

    try:
        email = _serializer().loads(token, salt=VERIFY_SALT, max_age=VERIFY_MAX_AGE_SECONDS)
    except SignatureExpired:
        return jsonify({"error": "This verification link has expired. Request a new one."}), 400
    except BadSignature:
        return jsonify({"error": "This verification link is invalid."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.is_verified:
        return jsonify({"message": "Your email is already verified.", "user": user.to_dict()}), 200

    user.is_verified = True
    db.session.commit()
    return jsonify({"message": "Email verified!", "user": user.to_dict()}), 200


@auth_bp.route("/resend-verification", methods=["POST"])
@jwt_required()
def resend_verification():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.is_verified:
        return jsonify({"message": "Your email is already verified."}), 200

    dev_verification_token = _send_verification_email(user)

    response = {"message": "Verification email sent."}
    if current_app.config.get("DEBUG"):
        response["dev_verification_token"] = dev_verification_token

    return jsonify(response), 200
