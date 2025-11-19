from flask import Blueprint, jsonify
from backend.models.customer import Event

# IMPORTANT → give the blueprint a real prefix
event_details_bp = Blueprint("event_details", __name__, url_prefix="/events")

@event_details_bp.route("/<int:event_id>", methods=["GET"])
def get_event_by_id(event_id):
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"error": "Event not found"}), 404

    return jsonify({
    "event_id": event.event_id,
    "event_name": event.event_name,
    "event_date": event.event_date,
    "description": event.description,
    "organizer_name": event.organizer_name,
    "status": event.status,

    # ADD THESE TWO
    "category_id": event.category_id,
    "venue_id": event.venue_id,

    "category": {
        "category_id": event.category.category_id,
        "category_name": event.category.category_name
    } if event.category else None,

    "venue": {
        "venue_id": event.venue.venue_id,
        "venue_name": event.venue.venue_name,
        "city": event.venue.city,
        "address": event.venue.address
    } if event.venue else None
})

