// ============================================================
// EVENT DETAILS PAGE - FINAL WORKING VERSION
// ============================================================

function getEventId() {
  const p = new URLSearchParams(window.location.search);
  return parseInt(p.get("id"), 10);
}

let EVENT_DETAILS_CACHE = null;

async function loadEventDetails() {
  const eventId = getEventId();

  if (!eventId) {
    alert("Invalid event.");
    window.location.href = "index.html";
    return;
  }

  try {
    // 1. Load event
    const event = await fetchEventById(eventId);
    console.log("===== EVENT FROM API =====");
    console.log(event);
    console.log("event.category_id:", event.category_id);
    console.log("event.venue_id:", event.venue_id);


    // 2. Load relational data
    const tickets = await apiRequest(`${API_BASE_URL}/event-tickets/${eventId}`);
    const categories = await apiRequest(`${API_BASE_URL}/categories/`);
    const venues = await apiRequest(`${API_BASE_URL}/venues/`);

    console.log("===== ALL VENUES =====");
console.log(venues);

console.log("===== ALL CATEGORIES =====");
console.log(categories);


    // 3. Join relational data
    const category = categories.find(c => Number(c.category_id) === Number(event.category_id));
const venue = venues.find(v => Number(v.venue_id) === Number(event.venue_id));

console.log("===== MATCHED CATEGORY =====", category);
console.log("===== MATCHED VENUE =====", venue);


    EVENT_DETAILS_CACHE = {
      ...event,
      category,
      venue,
      tickets
    };

    displayEventDetails(EVENT_DETAILS_CACHE);
    loadTicketOptions(EVENT_DETAILS_CACHE.tickets);

  } catch (err) {
    console.error("Error loading event:", err);
    alert("Failed to load event details.");
    window.location.href = "index.html";
  }
}

function displayEventDetails(event) {
  document.title = `${event.event_name} - TixMaster`;

  document.getElementById("eventImage").src =
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800";

  document.getElementById("eventCategory").textContent =
    event.category?.category_name || "Event";

  document.getElementById("eventName").textContent = event.event_name;
  document.getElementById("eventDescription").textContent =
    event.description || "";

  const date = new Date(event.event_date);
  document.getElementById("eventDateTime").textContent =
    !isNaN(date)
      ? date.toLocaleString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      : event.event_date;

  document.getElementById("eventVenue").textContent = event.venue
    ? `${event.venue.venue_name}\n${event.venue.address}`
    : "Venue not available";

  document.getElementById("eventOrganizer").textContent =
    event.organizer_name || "Organizer";
}

function loadTicketOptions(tickets) {
  const container = document.getElementById("ticketOptions");

  if (!tickets || tickets.length === 0) {
    container.innerHTML = `<p style="color:var(--text-secondary);">No tickets available.</p>`;
    return;
  }

  container.innerHTML = tickets
    .map(
      t => `
      <div class="ticket-option">
        <div class="ticket-info">
          <h4>${t.ticket_type}</h4>
          <p>${t.quantity_available} available</p>
        </div>
        <div class="ticket-price">
          <div class="price">$${parseFloat(t.price).toFixed(2)}</div>
          <button class="btn-primary"
            onclick="purchaseTicket(${t.ticket_id}, '${t.ticket_type}', ${t.price})">
            Select
          </button>
        </div>
      </div>
    `
    )
    .join("");
}

function purchaseTicket(id, type, price) {
  alert(`Stub: purchase ${type} for $${price}.`);
}

document.addEventListener("DOMContentLoaded", loadEventDetails);
