from app import create_app, socketio

flask_app = create_app()

if __name__ == "__main__":
    socketio.run(
        flask_app,
        host="0.0.0.0",
        port=5000,
        debug=True,
        allow_unsafe_werkzeug=True
    )
