from backend.db import db
from datetime import datetime
from passlib.hash import pbkdf2_sha256


class Customer(db.Model):
    __tablename__ = "customer"

    customer_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="user")
    phone = db.Column(db.String(20))
    registration_date = db.Column(db.Date, nullable=False, default=datetime.now)

    def set_password(self, password):
        self.password_hash = pbkdf2_sha256.hash(password)

    def check_password(self, password):
        return pbkdf2_sha256.verify(password, self.password_hash)

    @property
    def full_name(self):
        return f"{self.first_name or ''} {self.last_name or ''}".strip()


class Category(db.Model):
    __tablename__ = "category"

    category_id = db.Column(db.Integer, primary_key=True)
    category_name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.Text)


class Venue(db.Model):
    __tablename__ = "venue"

    venue_id = db.Column(db.Integer, primary_key=True)
    venue_name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    phone = db.Column(db.String(15))


class Event(db.Model):
    __tablename__ = "event"

    event_id = db.Column(db.Integer, primary_key=True)
    event_name = db.Column(db.String(150), nullable=False)
    event_date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.Text)
    organizer_name = db.Column(db.String(100), nullable=False)
    organizer_email = db.Column(db.String(100))

    category_id = db.Column(db.Integer, db.ForeignKey("category.category_id"), nullable=False)
    venue_id = db.Column(db.Integer, db.ForeignKey("venue.venue_id"), nullable=False)

    # ✅ FIX – add relationships so event.category and event.venue work
    category = db.relationship("Category", backref="events", lazy=True)
    venue = db.relationship("Venue", backref="events", lazy=True)

    total_tickets = db.Column(db.Integer, nullable=False)
    tickets_sold = db.Column(db.Integer, default=0)

    status = db.Column(
        db.Enum("Upcoming", "Ongoing", "Completed", "Cancelled"),
        default="Upcoming",
    )



class Ticket(db.Model):
    __tablename__ = "TICKET"

    ticket_id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(
        db.Integer,
        db.ForeignKey("event.event_id", ondelete="CASCADE"),
        nullable=False,
    )
    ticket_type = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    quantity_available = db.Column(db.Integer, nullable=False)

    purchase_tickets = db.relationship("PurchaseTicket", back_populates="ticket")


class Purchase(db.Model):
    __tablename__ = "PURCHASE"

    purchase_id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(
        db.Integer,
        db.ForeignKey("CUSTOMER.customer_id", ondelete="CASCADE"),
        nullable=False,
    )
    purchase_date = db.Column(db.DateTime, nullable=False, default=datetime.now)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)

    payment_method = db.Column(
        db.Enum("Credit Card", "Debit Card", "PayPal", "Cash"),
        nullable=False,
    )

    payment_status = db.Column(
        db.Enum("Pending", "Completed", "Failed", "Refunded"),
        default="Pending",
    )

    # ✅ Relationship added
    purchase_tickets = db.relationship(
        "PurchaseTicket",
        back_populates="purchase",
        cascade="all, delete-orphan",
    )


class PurchaseTicket(db.Model):
    __tablename__ = "PURCHASE_TICKET"

    purchase_ticket_id = db.Column(db.Integer, primary_key=True)
    purchase_id = db.Column(
        db.Integer,
        db.ForeignKey("PURCHASE.purchase_id", ondelete="CASCADE"),
        nullable=False,
    )
    ticket_id = db.Column(
        db.Integer,
        db.ForeignKey("TICKET.ticket_id", ondelete="RESTRICT"),
        nullable=False,
    )

    quantity = db.Column(db.Integer, nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)

    __table_args__ = (
        db.UniqueConstraint("purchase_id", "ticket_id", name="unique_purchase_ticket"),
    )

    # ✅ Relationships back
    purchase = db.relationship("Purchase", back_populates="purchase_tickets")
    ticket = db.relationship("Ticket", back_populates="purchase_tickets")
