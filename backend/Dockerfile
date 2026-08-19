FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

# Single eventlet worker: Flask-SocketIO needs an async-capable worker class
# to handle websocket upgrades, and presence/room state in app/sockets.py
# lives in-process, so multiple workers would each have their own
# disconnected view of who's online. For real horizontal scaling, add
# Flask-SocketIO's message_queue option (Redis) and you can go back to
# multiple workers/containers - not needed at this project's scale.
CMD ["gunicorn", "--worker-class", "eventlet", "--bind", "0.0.0.0:5000", "--workers", "1", "run:flask_app"]
