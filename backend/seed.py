"""
Run with: python seed.py
Populates the database with demo data so the frontend has something
to display immediately (admin account, sample guides, sample attractions).
"""
from app import create_app, db
from app.models.user import User, UserRole
from app.models.guide import GuideProfile
from app.models.attraction import Attraction

app = create_app()

with app.app_context():
    db.create_all()

    # --- Admin account ---
    if not User.query.filter_by(email="admin@ecoguide.co.ke").first():
        admin = User(full_name="EcoGuide Admin", email="admin@ecoguide.co.ke", role=UserRole.ADMIN.value)
        admin.set_password("Admin@123")
        db.session.add(admin)

    # --- Sample guide ---
    if not User.query.filter_by(email="guide1@ecoguide.co.ke").first():
        guide_user = User(
            full_name="Wanjiru Otieno", email="guide1@ecoguide.co.ke",
            role=UserRole.GUIDE.value, phone="+254712345678"
        )
        guide_user.set_password("Guide@123")
        db.session.add(guide_user)
        db.session.flush()

        guide_profile = GuideProfile(
            user_id=guide_user.id,
            bio="Certified eco-guide with 8 years exploring the Kakamega rainforest.",
            languages="English,Swahili,Luhya",
            specialization="Birdwatching & Forest Trails",
            years_experience=8,
            hourly_rate=1500.0,
            is_approved=True,
            is_available=True,
            current_lat=0.2827,
            current_lng=34.7519,
            average_rating=4.8,
            total_reviews=32,
            total_tours_completed=57,
        )
        db.session.add(guide_profile)

    # --- Sample attractions ---
    attractions = [
        dict(
            name="Kakamega Forest National Reserve",
            description="Kenya's only remaining tropical rainforest, home to rare birds, primates, and butterflies.",
            category="Forest",
            lat=0.2827, lng=34.7519,
            entrance_fee=600, opening_hours="6:00 AM - 6:00 PM",
            best_time_to_visit="June - September",
        ),
        dict(
            name="Isecheno Nature Trail",
            description="A guided walking trail through primary forest known for its butterfly diversity.",
            category="Nature Trail",
            lat=0.2260, lng=34.8680,
            entrance_fee=400, opening_hours="7:00 AM - 5:00 PM",
            best_time_to_visit="Year-round",
        ),
        dict(
            name="Udo Waterfalls",
            description="A scenic waterfall tucked inside the forest, popular for picnics and photography.",
            category="Waterfall",
            lat=0.2460, lng=34.7890,
            entrance_fee=300, opening_hours="8:00 AM - 5:00 PM",
            best_time_to_visit="Dry season",
        ),
    ]
    for a in attractions:
        if not Attraction.query.filter_by(name=a["name"]).first():
            db.session.add(Attraction(**a))

    db.session.commit()
    print("Seed complete.")
    print("Admin login -> admin@ecoguide.co.ke / Admin@123")
    print("Guide login -> guide1@ecoguide.co.ke / Guide@123")
