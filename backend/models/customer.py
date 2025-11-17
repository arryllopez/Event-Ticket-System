# backend/models/customer.py

from datetime import datetime, date
from backend.db import db
from werkzeug.security import generate_password_hash, check_password_hash


class Category(db.Model):
    __tablename__ = "category"

    category_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category_name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)

    def __repr__(self):
        return f"<Category {self.category_name}>"


class Venue(db.Model):
    __tablename__ = "venue"

    venue_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    venue_name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    phone = db.Column(db.String(15))

    def __repr__(self):
        return f"<Venue {self.venue_name} ({self.city})>"


class Event(db.Model):
    __tablename__ = "event"

    event_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_name = db.Column(db.String(150), nullable=False)
    event_date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.Text)

    organizer_name = db.Column(db.String(100), nullable=False)
    organizer_email = db.Column(db.String(100))

    category_id = db.Column(
        db.Integer, db.ForeignKey("category.category_id"), nullable=False
    )
    venue_id = db.Column(
        db.Integer, db.ForeignKey("venue.venue_id"), nullable=False
    )

    total_tickets = db.Column(db.Integer, nullable=False)
    tickets_sold = db.Column(db.Integer, nullable=False, default=0)

    status = db.Column(
        db.Enum("Upcoming", "Ongoing", "Completed", "Cancelled", name="event_status_enum"),
        nullable=False,
        default="Upcoming",
    )

    category = db.relationship("Category", backref=db.backref("events", lazy=True))
    venue = db.relationship("Venue", backref=db.backref("events", lazy=True))
    tickets = db.relationship("Ticket", backref="event", lazy=True)

    def __repr__(self):
        return f"<Event {self.event_name} on {self.event_date}>"


class Ticket(db.Model):
    __tablename__ = "ticket"

    ticket_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey("event.event_id"), nullable=False)

    ticket_type = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    quantity_available = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f"<Ticket {self.ticket_type} for event {self.event_id}>"


class Customer(db.Model):
    __tablename__ = "customer"

    customer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)

    email = db.Column(db.String(100), unique=True, nullable=False)

    # Uses your schema fields
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user")

    phone = db.Column(db.String(15))
    registration_date = db.Column(db.Date, nullable=False, default=date.today)

    purchases = db.relationship("Purchase", backref="customer", lazy=True)

    # 🔥 ADD PASSWORD HANDLING METHODS (this fixes your issue)
    def set_password(self, password):
        """Hash and store password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verify password match."""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<Customer {self.email}>"


class Purchase(db.Model):
    __tablename__ = "purchase"

    purchase_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(
        db.Integer, db.ForeignKey("customer.customer_id"), nullable=False
    )

    purchase_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    total_amount = db.Column(db.Numeric(10, 2), nullable=False)

    payment_method = db.Column(
        db.Enum("Credit Card", "Debit Card", "PayPal", "Cash", name="payment_method_enum"),
        nullable=False,
    )

    payment_status = db.Column(
        db.Enum("Pending", "Completed", "Failed", "Refunded", name="payment_status_enum"),
        nullable=False,
        default="Pending",
    )

    purchase_tickets = db.relationship("PurchaseTicket", backref="purchase", lazy=True)

    def __repr__(self):
        return f"<Purchase {self.purchase_id} (${self.total_amount})>"


class PurchaseTicket(db.Model):
    __tablename__ = "purchase_ticket"

    purchase_ticket_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    purchase_id = db.Column(db.Integer, db.ForeignKey("purchase.purchase_id"), nullable=False)
    ticket_id = db.Column(db.Integer, db.ForeignKey("ticket.ticket_id"), nullable=False)

    quantity = db.Column(db.Integer, nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)

    ticket = db.relationship("Ticket", backref=db.backref("purchase_links", lazy=True))

    __table_args__ = (
        db.UniqueConstraint("purchase_id", "ticket_id", name="uq_purchase_ticket_purchase_id_ticket_id"),
    )

    def __repr__(self):
        return f"<PurchaseTicket purchase={self.purchase_id} ticket={self.ticket_id}>"
