from app import create_app, db

# Import ALL models so SQLAlchemy knows about every table
from app.models.user import User
from app.models.guide import GuideProfile
from app.models.attraction import Attraction
from app.models.booking import Booking
from app.models.review import Review
from app.models.notification import Notification
from app.models.message import Message
from app.models.favorite import Favorite

app = create_app()

with app.app_context():
    db.create_all()

    print("=" * 60)
    print("✅ EcoGuide database initialized successfully!")
    print("=" * 60)

    print("\nTables available:")

    for table_name in db.metadata.tables.keys():
        print(f"  ✓ {table_name}")

    print("=" * 60)
