# functionality for generating 
# customer purchases and exporting customer tickets purchased

from flask import Blueprint, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.db import db
from backend.models.customer import Customer, Purchase, PurchaseTicket, Ticket, Event
from io import StringIO
import csv

customer_dashboard_bp = Blueprint("customer_dashboard", __name__, url_prefix="/api/customer")


# 1️⃣ GET ALL CUSTOMER PURCHASES
@customer_dashboard_bp.route("/purchases", methods=["GET"])
@jwt_required()
def get_customer_purchases():
    email = get_jwt_identity()
    customer = Customer.query.filter_by(email=email).first()

    if not customer:
        return jsonify({"error": "User not found"}), 404

    rows = (
        db.session.query(Purchase, PurchaseTicket, Ticket, Event)
        .join(PurchaseTicket, Purchase.purchase_id == PurchaseTicket.purchase_id)
        .join(Ticket, PurchaseTicket.ticket_id == Ticket.ticket_id)
        .join(Event, Ticket.event_id == Event.event_id)
        .filter(Purchase.customer_id == customer.customer_id)
        .order_by(Purchase.purchase_date.desc())
        .all()
    )

    result = []
    for p, pt, t, e in rows:
        result.append({
            "purchase_id": p.purchase_id,
            "purchase_date": p.purchase_date.strftime("%Y-%m-%d %H:%M:%S"),
            "payment_status": p.payment_status,
            "ticket_type": t.ticket_type,
            "ticket_price": float(t.price),
            "quantity": pt.quantity,
            "subtotal": float(pt.subtotal),
            "event_id": e.event_id,
            "event_name": e.event_name,
            "event_date": e.event_date.strftime("%Y-%m-%d %H:%M:%S"),
        })

    return jsonify(result), 200


# 2️⃣ EXPORT AS CSV
@customer_dashboard_bp.route("/purchases/export", methods=["GET"])
@jwt_required()
def export_purchases_csv():
    email = get_jwt_identity()
    customer = Customer.query.filter_by(email=email).first()

    if not customer:
        return jsonify({"error": "User not found"}), 404

    rows = (
        db.session.query(Purchase, PurchaseTicket, Ticket, Event)
        .join(PurchaseTicket, Purchase.purchase_id == PurchaseTicket.purchase_id)
        .join(Ticket, PurchaseTicket.ticket_id == Ticket.ticket_id)
        .join(Event, Ticket.event_id == Event.event_id)
        .filter(Purchase.customer_id == customer.customer_id)
        .all()
    )

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Purchase ID", "Purchase Date", "Payment Status",
        "Event Name", "Event Date",
        "Ticket Type", "Price", "Qty", "Subtotal"
    ])

    for p, pt, t, e in rows:
        writer.writerow([
            p.purchase_id,
            p.purchase_date.strftime("%Y-%m-%d %H:%M:%S"),
            p.payment_status,
            e.event_name,
            e.event_date.strftime("%Y-%m-%d %H:%M:%S"),
            t.ticket_type,
            float(t.price),
            pt.quantity,
            float(pt.subtotal)
        ])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=purchases.csv"
        }
    )
