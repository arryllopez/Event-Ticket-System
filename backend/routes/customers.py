from flask import Blueprint, jsonify
from backend.models.customer import Customer

customers_bp = Blueprint("customers", __name__, url_prefix="/customers")

@customers_bp.route("/", methods=["GET"])
def get_customers():
    customers = Customer.query.all()
    return jsonify([
        {
            "customer_id": c.customer_id,
            "first_name": c.first_name,
            "last_name": c.last_name,
            "email": c.email,
            "phone": c.phone,
            "registration_date": str(c.registration_date)
        }
        for c in customers
    ])


