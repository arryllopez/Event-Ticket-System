from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.db import db
from backend.models.customer import Purchase, PurchaseTicket, Ticket, Customer
from datetime import datetime

checkout_bp = Blueprint("checkout", __name__)

@checkout_bp.route("/api/checkout", methods=["POST", "OPTIONS"])
@jwt_required()
def checkout():
    if request.method == "OPTIONS":
        return jsonify({"msg": "OK"}), 200

    data = request.get_json()
    items = data.get("items", [])

    if not items:
        return jsonify({"msg": "Cart is empty"}), 400

    user_email = get_jwt_identity()

    customer = Customer.query.filter_by(email=user_email).first()
    if not customer:
        return jsonify({"msg": "Customer not found"}), 404

    # Calculate total
    total_amount = sum(i["price"] * i["quantity"] for i in items)

    # Create purchase record
    purchase = Purchase(
        customer_id=customer.customer_id,
        purchase_date=datetime.now(),
        total_amount=total_amount,
        payment_method="Credit Card",
        payment_status="Completed"
    )
    db.session.add(purchase)
    db.session.commit()

    # Add ticket records
    for item in items:
        ticket = Ticket.query.get(item["ticket_id"])

        if not ticket:
            continue

        # Reduce available quantity
        ticket.quantity_available -= item["quantity"]

        purchase_ticket = PurchaseTicket(
            purchase_id=purchase.purchase_id,
            ticket_id=item["ticket_id"],
            quantity=item["quantity"],
            subtotal=item["price"] * item["quantity"]
        )

        db.session.add(purchase_ticket)

    db.session.commit()

    return jsonify({"msg": "Purchase completed!", "purchase_id": purchase.purchase_id}), 200
