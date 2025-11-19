from flask import Blueprint, request, jsonify
from backend.db import db
from backend.models.customer import Event, Customer
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)
from datetime import datetime

auth_bp = Blueprint("auth", __name__)


# -------------------------
# REGISTER
# -------------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        if Customer.query.filter_by(email=email).first():
            return jsonify({"error": "Email already exists"}), 400

        customer = Customer(
            email=email,
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            registration_date=datetime.now().date(),
        )
        customer.set_password(password)

        db.session.add(customer)
        db.session.commit()

        return jsonify({"message": "User registered"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# LOGIN
# -------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    customer = Customer.query.filter_by(email=email).first()

    if not customer or not customer.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    # Auto-promote to admin if they own events
    try:
        if customer.role != "admin":
            owns_events = (
                db.session.query(Event)
                .filter(Event.organizer_email == customer.email)
                .count() > 0
            )
            if owns_events:
                customer.role = "admin"
                db.session.commit()
    except Exception:
        db.session.rollback()

    # JWT identity is NOW THE EMAIL
    token = create_access_token(
        identity=customer.email,
        additional_claims={"role": customer.role},
    )

    return jsonify(
        {
            "token": token,
            "role": customer.role,
            "email": customer.email,
            "first_name": customer.first_name,
            "last_name": customer.last_name,
        }
    )


# -------------------------
# CURRENT USER INFO
# -------------------------
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    identity = get_jwt_identity()  # this is the email now
    claims = get_jwt()

    customer = Customer.query.filter_by(email=identity).first()
    if not customer:
        return jsonify({"error": "User not found"}), 404

    return jsonify(
        {
            "customer_id": customer.customer_id,
            "role": claims.get("role"),
            "email": customer.email,
            "first_name": customer.first_name,
            "last_name": customer.last_name,
        }
    ), 200
