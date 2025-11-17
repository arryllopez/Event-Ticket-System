# backend/app.py
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from backend.db import init_db

# ROUTE BLUEPRINTS
from backend.routes.auth import auth_bp
from backend.routes.events import events_bp
from backend.routes.categories import categories_bp
from backend.routes.venues import venues_bp
from backend.routes.customers import customers_bp
from backend.routes.tickets import tickets_bp
from backend.routes.purchases import purchases_bp
from backend.routes.event_details import event_details_bp
from backend.routes.event_tickets import event_tickets_bp


def create_app():
    app = Flask(__name__)

    # CORS
    CORS(app)

    # DB setup
    init_db(app)

    # JWT
    app.config["JWT_SECRET_KEY"] = "super-secret-change-me"
    JWTManager(app)

    # ============================
    #     REGISTER BLUEPRINTS
    # ============================

    # AUTH — login, register, user actions
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    # EVENTS — list, search
    app.register_blueprint(events_bp, url_prefix="/api/events")

    # EVENT DETAILS — /api/events/<id>
    app.register_blueprint(event_details_bp, url_prefix="/api/events")

    # EVENT TICKETS — /api/event-tickets/<id>
    app.register_blueprint(event_tickets_bp, url_prefix="/api")

    # CATEGORIES
    app.register_blueprint(categories_bp, url_prefix="/api/categories")

    # VENUES
    app.register_blueprint(venues_bp, url_prefix="/api/venues")

    # CUSTOMERS
    app.register_blueprint(customers_bp, url_prefix="/api/customers")

    # ALL TICKETS (admin)
    app.register_blueprint(tickets_bp, url_prefix="/api/tickets")

    # PURCHASES
    app.register_blueprint(purchases_bp, url_prefix="/api/purchases")

    @app.route("/")
    def home():
        return "API is running"

    return app
