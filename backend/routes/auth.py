from flask import Blueprint, request, jsonify, send_file
from backend.db import db
from backend.models.customer import Event, Customer
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)
from backend.utils.roles import admin_required
from datetime import datetime
import requests
import traceback
import csv
import os

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        print("Request received!")
        print("Content-Type:", request.headers.get("Content-Type"))
        print("Data:", request.get_json())

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
        print(f"Error in register: {str(e)}")
        return jsonify({"error": str(e)}), 500


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

    # 🔐 Auto-promote to admin if this email matches any Event.organizer_email
    try:
        if customer.role != "admin":
            owns_events = (
                db.session.query(Event)
                .filter(Event.organizer_email == customer.email)
                .count()
                > 0
            )
            if owns_events:
                customer.role = "admin"
                db.session.commit()
    except Exception as e:
        # Don't block login on this; just log and rollback any partial change
        print(f"Error while checking admin role on login: {e}")
        db.session.rollback()

    token = create_access_token(
        identity=str(customer.customer_id),
        additional_claims={"role": customer.role},
    )

    # Return extra info for frontend
    return jsonify(
        {
            "token": token,
            "role": customer.role,
            "email": customer.email,
            "first_name": customer.first_name,
            "last_name": customer.last_name,
        }
    )


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    identity = get_jwt_identity()  # this is the customer_id as a string
    claims = get_jwt()  # contains the role

    customer = Customer.query.get(int(identity))

    return jsonify(
        {
            "customer_id": int(identity),
            "role": claims.get("role"),
            "email": customer.email if customer else None,
            "first_name": customer.first_name if customer else None,
            "last_name": customer.last_name if customer else None,
        }
    )


@auth_bp.route("/admin-test", methods=["GET"])
@admin_required
def admin_test():
    return jsonify({"message": "You are an admin"})


# ✅ NEW: Get all events the logged-in admin is responsible for
@auth_bp.route("/admin/events", methods=["GET"])
@jwt_required()
def get_admin_events():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    identity = get_jwt_identity()
    customer = Customer.query.get(int(identity))
    if not customer:
        return jsonify({"error": "User not found"}), 404

    events = Event.query.filter_by(organizer_email=customer.email).all()

    result = []
    for e in events:
        result.append(
            {
                "event_id": e.event_id,
                "event_name": e.event_name,
                "event_date": e.event_date.strftime("%Y-%m-%d %H:%M:%S"),
                "description": e.description,
                "organizer_name": e.organizer_name,
                "organizer_email": e.organizer_email,
                "category_id": e.category_id,
                "venue_id": e.venue_id,
                "total_tickets": e.total_tickets,
                "tickets_sold": e.tickets_sold,
                "status": e.status,
            }
        )

    return jsonify(result), 200


# Create Event (Admin only)
@auth_bp.route("/events", methods=["POST"])
@jwt_required()
def create_event():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json() or {}

    try:
        name = data.get("event_name")
        date = data.get("event_date")
        description = data.get("description")
        organizer_name = data.get("organizer_name")
        organizer_email = data.get("organizer_email")
        category_id = data.get("category_id")
        venue_id = data.get("venue_id")
        total_tickets = data.get("total_tickets")
        ticket_price = data.get("ticket_price", 0.0)  # currently unused here

        # Fill organizer info from logged-in customer if not provided
        identity = get_jwt_identity()
        customer = Customer.query.get(int(identity))
        if customer:
            if not organizer_email:
                organizer_email = customer.email
            if not organizer_name:
                organizer_name = customer.full_name or "Organizer"

        # Basic Validation
        if not all([name, date, organizer_name, organizer_email, category_id, venue_id, total_tickets]):
            return jsonify({"error": "Missing required fields"}), 400

        event_date = datetime.strptime(date, "%Y-%m-%d %H:%M:%S")

        new_event = Event(
            event_name=name,
            event_date=event_date,
            description=description,
            organizer_name=organizer_name,
            organizer_email=organizer_email,
            category_id=category_id,
            venue_id=venue_id,
            total_tickets=total_tickets,
            tickets_sold=0,
            status="Upcoming",
        )

        db.session.add(new_event)
        db.session.commit()
        return jsonify({"message": "Event created successfully"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Get all events (Public)
@auth_bp.route("/events", methods=["GET"])
def get_events():
    try:
        events = Event.query.all()
        result = []
        for e in events:
            result.append(
                {
                    "event_id": e.event_id,
                    "event_name": e.event_name,
                    "event_date": e.event_date.strftime("%Y-%m-%d %H:%M:%S"),
                    "organizer_name": e.organizer_name,
                    "organizer_email": e.organizer_email,
                    "status": e.status,
                    "tickets_sold": e.tickets_sold,
                    "total_tickets": e.total_tickets,
                }
            )
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Update Event (Admin only)
@auth_bp.route("/events/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json() or {}
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    # OPTIONAL: enforce that admins can only update their own events
    identity = get_jwt_identity()
    customer = Customer.query.get(int(identity))
    if customer and event.organizer_email != customer.email:
        return jsonify({"error": "You can only modify your own events"}), 403

    try:
        for field in [
            "event_name",
            "description",
            "organizer_name",
            "organizer_email",
            "status",
        ]:
            if field in data:
                setattr(event, field, data[field])

        if "event_date" in data:
            event.event_date = datetime.strptime(
                data["event_date"], "%Y-%m-%d %H:%M:%S"
            )

        db.session.commit()
        return jsonify({"message": "Event updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Delete Event (Admin only)
@auth_bp.route("/events/<int:event_id>", methods=["DELETE"])
@jwt_required()
def delete_event(event_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    # OPTIONAL: enforce that admins can only delete their own events
    identity = get_jwt_identity()
    customer = Customer.query.get(int(identity))
    if customer and event.organizer_email != customer.email:
        return jsonify({"error": "You can only delete your own events"}), 403

    try:
        db.session.delete(event)
        db.session.commit()
        return jsonify({"message": "Event deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/tickets/buy", methods=["POST"])
@jwt_required()
def buy_tickets():
    try:
        from backend.models.customer import Purchase, PurchaseTicket, Ticket  # adjust if needed

        identity = get_jwt_identity()
        data = request.get_json() or {}

        ticket_items = data.get("tickets", [])
        payment_method = data.get("payment_method", "Credit Card")

        if not ticket_items or not isinstance(ticket_items, list):
            return jsonify({"error": "Invalid or empty ticket list"}), 400

        total_amount = 0
        purchase_ticket_entries = []

        for item in ticket_items:
            ticket_id = item.get("ticket_id")
            quantity = item.get("quantity")

            if not ticket_id or not quantity or quantity <= 0:
                return jsonify({"error": f"Invalid ticket entry: {item}"}), 400

            ticket = Ticket.query.get(ticket_id)
            if not ticket:
                return jsonify({"error": f"Ticket ID {ticket_id} not found"}), 404

            if ticket.quantity_available < quantity:
                return jsonify(
                    {"error": f"Not enough tickets for Ticket ID {ticket_id}"}
                ), 400

            subtotal = float(ticket.price) * quantity
            total_amount += subtotal

            purchase_ticket_entries.append(
                {
                    "ticket_id": ticket_id,
                    "quantity": quantity,
                    "subtotal": subtotal,
                }
            )

            ticket.quantity_available -= quantity  # Reduce inventory

        new_purchase = Purchase(
            customer_id=identity,
            total_amount=total_amount,
            payment_method=payment_method,
            payment_status="Completed",
        )

        db.session.add(new_purchase)
        db.session.flush()  # to get purchase_id

        for entry in purchase_ticket_entries:
            pt = PurchaseTicket(
                purchase_id=new_purchase.purchase_id,
                ticket_id=entry["ticket_id"],
                quantity=entry["quantity"],
                subtotal=entry["subtotal"],
            )
            db.session.add(pt)

        db.session.commit()
        return jsonify({"message": "Purchase successful", "total": total_amount}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/tickets/my", methods=["GET"])
@jwt_required()
def view_my_tickets():
    from backend.models.customer import Purchase, PurchaseTicket, Ticket, Event  # adjust if needed

    identity = get_jwt_identity()

    try:
        purchases = Purchase.query.filter_by(customer_id=identity).all()
        results = []

        for purchase in purchases:
            tickets = PurchaseTicket.query.filter_by(
                purchase_id=purchase.purchase_id
            ).all()
            ticket_details = []

            for pt in tickets:
                ticket = Ticket.query.get(pt.ticket_id)
                event = Event.query.get(ticket.event_id) if ticket else None

                ticket_details.append(
                    {
                        "ticket_type": ticket.ticket_type if ticket else "N/A",
                        "event": event.event_name if event else "Unknown",
                        "quantity": pt.quantity,
                        "subtotal": float(pt.subtotal),
                    }
                )

            results.append(
                {
                    "purchase_id": purchase.purchase_id,
                    "total_amount": float(purchase.total_amount),
                    "payment_method": purchase.payment_method,
                    "purchase_date": purchase.purchase_date.strftime(
                        "%Y-%m-%d %H:%M:%S"
                    ),
                    "tickets": ticket_details,
                }
            )

        return jsonify(results), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/purchases", methods=["GET"])
@jwt_required()
def get_purchases():
    try:
        identity = get_jwt_identity()
        user_id = int(identity)

        print(f"🔹 Fetching purchases for user_id: {user_id}")

        from backend.models.customer import Purchase, Ticket, Event

        purchases = Purchase.query.filter_by(customer_id=user_id).all()
        print(f"🔹 Found {len(purchases)} purchases")

        result = []

        for purchase in purchases:
            print(f"➡ Purchase ID: {purchase.purchase_id}")
            items = []

            for pt in purchase.purchase_tickets:
                print(f"   ↳ PurchaseTicket ID: {pt.purchase_ticket_id}")

                ticket = Ticket.query.get(pt.ticket_id)
                event = Event.query.get(ticket.event_id) if ticket else None

                items.append(
                    {
                        "ticket_id": pt.ticket_id,
                        "ticket_type": ticket.ticket_type if ticket else "Unknown",
                        "event_name": event.event_name if event else "Unknown",
                        "quantity": pt.quantity,
                        "subtotal": float(pt.subtotal),
                    }
                )

            result.append(
                {
                    "purchase_id": purchase.purchase_id,
                    "purchase_date": purchase.purchase_date.strftime(
                        "%Y-%m-%d %H:%M:%S"
                    ),
                    "total_amount": float(purchase.total_amount),
                    "payment_method": purchase.payment_method,
                    "payment_status": purchase.payment_status,
                    "items": items,
                }
            )

        return jsonify(result), 200

    except Exception as e:
        traceback.print_exc()
        print(f"❌ Error in /purchases: {str(e)}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/weather/<city>", methods=["GET"])
@jwt_required(optional=True)
def get_weather(city):
    try:
        # Replace spaces with '+' for URL safety
        city_query = city.replace(" ", "+")
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={city_query}&count=1"

        geo_response = requests.get(url)
        geo_data = geo_response.json()

        if "results" not in geo_data or len(geo_data["results"]) == 0:
            return jsonify({"error": "City not found"}), 404

        lat = geo_data["results"][0]["latitude"]
        lon = geo_data["results"][0]["longitude"]

        weather_url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&current_weather=true"
        )

        weather_response = requests.get(weather_url)
        weather_data = weather_response.json()

        current = weather_data.get("current_weather", {})
        if not current:
            return jsonify({"error": "No weather data available"}), 500

        return jsonify(
            {
                "city": city,
                "temperature": current["temperature"],
                "windspeed": current["windspeed"],
                "weather_code": current["weathercode"],
            }
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/weather/event/<int:event_id>", methods=["GET"])
@jwt_required(optional=True)
def get_event_weather(event_id):
    try:
        from backend.models.customer import Event, Venue

        # Find the event
        event = Event.query.get(event_id)
        if not event:
            return jsonify({"error": "Event not found"}), 404

        # Get venue
        venue = Venue.query.get(event.venue_id)
        if not venue:
            return jsonify({"error": "Venue not found"}), 404

        city = venue.city
        city_query = city.replace(" ", "+")
        url = (
            f"https://geocoding-api.open-meteo.com/v1/search?"
            f"name={city_query}&count=1"
        )

        geo_response = requests.get(url)
        geo_data = geo_response.json()

        if "results" not in geo_data or len(geo_data["results"]) == 0:
            return jsonify({"error": "City not found"}), 404

        lat = geo_data["results"][0]["latitude"]
        lon = geo_data["results"][0]["longitude"]

        weather_url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&current_weather=true"
        )

        weather_response = requests.get(weather_url)
        weather_data = weather_response.json()

        current = weather_data.get("current_weather", {})
        if not current:
            return jsonify({"error": "No weather data available"}), 500

        return jsonify(
            {
                "event_name": event.event_name,
                "venue": venue.venue_name,
                "city": city,
                "temperature": current["temperature"],
                "windspeed": current["windspeed"],
                "weather_code": current["weathercode"],
            }
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/export/purchases", methods=["GET"])
@jwt_required()
def export_purchases():
    try:
        from backend.models.customer import Purchase, PurchaseTicket, Ticket, Event, Customer

        claims = get_jwt()
        if claims.get("role") != "admin":
            return jsonify({"error": "Admin only"}), 403

        export_dir = os.path.join(os.path.dirname(__file__), "..", "exports")
        os.makedirs(export_dir, exist_ok=True)
        filepath = os.path.join(export_dir, "purchases_export.csv")

        with open(filepath, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            writer.writerow(
                [
                    "Purchase ID",
                    "Customer ID",
                    "Customer Email",
                    "Event Name",
                    "Ticket Type",
                    "Unit Price",
                    "Quantity",
                    "Line Subtotal",
                    "Total Amount",
                    "Payment Method",
                    "Payment Status",
                    "Purchase Date",
                ]
            )

            purchases = Purchase.query.order_by(Purchase.purchase_id.asc()).all()
            for p in purchases:
                customer = Customer.query.get(p.customer_id)
                pts = p.purchase_tickets
                first = True
                for pt in pts:
                    ticket = Ticket.query.get(pt.ticket_id)
                    event = Event.query.get(ticket.event_id) if ticket else None

                    total_amt = float(p.total_amount) if first else ""
                    pay_method = p.payment_method if first else ""
                    pay_status = p.payment_status if first else ""
                    purch_date = (
                        p.purchase_date.strftime("%Y-%m-%d %H:%M")
                        if first
                        else ""
                    )

                    writer.writerow(
                        [
                            p.purchase_id if first else "",
                            customer.customer_id if first else "",
                            customer.email if first else "",
                            event.event_name if event else "Unknown",
                            ticket.ticket_type if ticket else "Unknown",
                            f"{float(ticket.price):.2f}" if ticket else "",
                            pt.quantity,
                            f"{float(pt.subtotal):.2f}",
                            f"{total_amt:.2f}"
                            if isinstance(total_amt, float)
                            else total_amt,
                            pay_method,
                            pay_status,
                            purch_date,
                        ]
                    )
                    first = False

        return send_file(filepath, as_attachment=True)

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
