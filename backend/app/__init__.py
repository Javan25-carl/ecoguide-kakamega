"""
EcoGuide Kakamega - Flask Application Factory
"""
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
jwt = JWTManager()
socketio = SocketIO()


def create_app(config_name=None):
    app = Flask(__name__)

    config_name = config_name or os.getenv("FLASK_ENV", "development")
    app.config.from_object(f"config.{config_name.capitalize()}Config")

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    jwt.init_app(app)
    cors_origins = app.config.get("CORS_ORIGINS", "*")

    if isinstance(cors_origins, str) and cors_origins != "*":
        cors_origins = [
            origin.strip()
            for origin in cors_origins.split(",")
            if origin.strip()
        ]

    CORS(
        app,
        supports_credentials=True,
        origins=cors_origins,
    )

    socketio.init_app(
        app,
        cors_allowed_origins=cors_origins,
        async_mode="threading",
    )

    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.user_routes import user_bp
    from app.routes.guide_routes import guide_bp
    from app.routes.attraction_routes import attraction_bp
    from app.routes.booking_routes import booking_bp
    from app.routes.review_routes import review_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.health_routes import health_bp
    from app.routes.notification_routes import notification_bp
    from app.routes.message_routes import message_bp
    from app.routes.favorite_routes import favorite_bp
    from app.routes.upload_routes import upload_bp

    app.register_blueprint(health_bp, url_prefix="/api/health")
    app.register_blueprint(notification_bp, url_prefix="/api/notifications")
    app.register_blueprint(message_bp, url_prefix="/api/messages")
    app.register_blueprint(favorite_bp, url_prefix="/api/favorites")
    app.register_blueprint(upload_bp, url_prefix="/api/uploads")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(guide_bp, url_prefix="/api/guides")
    app.register_blueprint(attraction_bp, url_prefix="/api/attractions")
    app.register_blueprint(booking_bp, url_prefix="/api/bookings")
    app.register_blueprint(review_bp, url_prefix="/api/reviews")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    from app import sockets  # noqa: F401 - registers @socketio.on handlers via decorators
    return app
