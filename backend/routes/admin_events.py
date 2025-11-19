# this is for CRUD applications for admins of event organizers
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from backend.db import db
from backend.models.customer import Customer, Event
from datetime import datetime

#admin blueprint
admin_bp = Blueprint("admin_events", __name__, url_prefix="/api/admin")

#verifying admin role through email of admins on database
def require_admin():
    email = get_jwt_identity()
    user = Customer.query.filter_by(email=email).first()

    if not user or user.role != "admin":
        return None
    return user


@admin_bp.route("/events", methods=["GET"])
@jwt_required()
def get_admin_events():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    identity = get_jwt_identity()
    customer = Customer.query.filter_by(email=identity).first()

    if not customer:
        return jsonify({"error": "User not found"}), 404

    events = Event.query.filter_by(organizer_email=customer.email).all()

    from backend.models.customer import PurchaseTicket, Ticket, Purchase

    result = []
    for e in events:
        revenue_query = (
            db.session.query(db.func.sum(PurchaseTicket.subtotal))
            .join(Ticket, Ticket.ticket_id == PurchaseTicket.ticket_id)
            .join(Purchase, Purchase.purchase_id == PurchaseTicket.purchase_id)
            .filter(Ticket.event_id == e.event_id)
            .filter(Purchase.payment_status == "Completed")
            .scalar()
        )

        revenue = float(revenue_query or 0)

        result.append({
            "event_id": e.event_id,
            "event_name": e.event_name,
            "event_date": e.event_date.strftime("%Y-%m-%d %H:%M:%S"),
            "description": e.description,
            "organizer_name": e.organizer_name,
            "organizer_email": e.organizer_email,
            "category_id": e.category_id,
            "category_name": e.category.category_name if e.category else None,
            "venue_id": e.venue_id,
            "venue_name": e.venue.venue_name if e.venue else None,
            "city": e.venue.city if e.venue else None,
            "total_tickets": e.total_tickets,
            "tickets_sold": e.tickets_sold,
            "status": e.status,
            "revenue":revenue
        })

    return jsonify(result), 200



@admin_bp.route("/debug/event-columns", methods=["GET"])
def debug_event_columns():
    return jsonify(list(Event.__table__.columns.keys()))




#create event
@admin_bp.route("/events", methods=["POST"])
@jwt_required()
def create_event():
    admin = require_admin()
    if not admin:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()

    try:
        new_event = Event(
            event_name=data["event_name"],
            event_date=datetime.fromisoformat(data["event_date"]),
            description=data.get("description", ""),
            organizer_name=f"{admin.first_name} {admin.last_name}",
            organizer_email=admin.email,
            category_id=data["category_id"],
            venue_id=data["venue_id"],
            total_tickets=data["total_tickets"],
            tickets_sold=0,
            status=data.get("status", "Upcoming"),
        )

        db.session.add(new_event)
        db.session.commit()

        return jsonify({
            "message": "Event created successfully",
             "event_id": new_event.event_id
        }), 201


    except Exception as e:
        return jsonify({"error": str(e)}), 400


#for updating events
@admin_bp.route("/events/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id):
    admin = require_admin()

    if not admin:
        return jsonify({"error": "Unauthorized"}), 403

    #checking if admin maatches admin email to avoid admins updating other admins;s events
    event = Event.query.get(event_id)
    if not event or event.organizer_email != admin.email:
        return jsonify({"error": "Event not found or not yours"}), 404

    data = request.get_json()

    try:
        event.event_name = data["event_name"]
        event.event_date = datetime.fromisoformat(data["event_date"])
        event.description = data.get("description", event.description)
        event.category_id = data["category_id"]
        event.venue_id = data["venue_id"]
        event.total_tickets = data["total_tickets"]
        event.status = data.get("status", event.status)

        db.session.commit()
        return jsonify({"message": "Event updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


#deleting events 
@admin_bp.route("/events/<int:event_id>", methods=["DELETE"])
@jwt_required()
def delete_event(event_id):
    admin = require_admin()
    if not admin:
        return jsonify({"error": "Unauthorized"}), 403

    #same thing as funciton above, admins cannot delete other admins events
    event = Event.query.get(event_id)
    if not event or event.organizer_email != admin.email:
        return jsonify({"error": "Event not found or not yours"}), 404

    try:
        db.session.delete(event)
        db.session.commit()
        return jsonify({"message": "Event deleted"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400
