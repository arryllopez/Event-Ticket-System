// ============================================================
// EVENT DETAILS PAGE - WITH CART SUPPORT
// ============================================================

// -------------------------------
// Get Event ID
// -------------------------------
function getEventId() {
  const p = new URLSearchParams(window.location.search);
  return parseInt(p.get("id"), 10);
}

let EVENT_DETAILS_CACHE = null;

// -------------------------------
// Load Event Details
// -------------------------------
async function loadEventDetails() {
  const eventId = getEventId();

  if (!eventId) {
    alert("Invalid event.");
    window.location.href = "index.html";
    return;
  }

  try {
    const event = await fetchEventById(eventId);
    const tickets = await apiRequest(`${API_BASE_URL}/event-tickets/${eventId}`);
    const categories = await apiRequest(`${API_BASE_URL}/categories/`);
    const venues = await apiRequest(`${API_BASE_URL}/venues/`);

    const category = categories.find(c => Number(c.category_id) === Number(event.category_id));
    const venue = venues.find(v => Number(v.venue_id) === Number(event.venue_id));

    EVENT_DETAILS_CACHE = { ...event, category, venue, tickets };

    displayEventDetails(EVENT_DETAILS_CACHE);
    loadTicketOptions(EVENT_DETAILS_CACHE.tickets);

  } catch (err) {
    console.error("Error loading event:", err);
    alert("Failed to load event details.");
    window.location.href = "index.html";
  }
}

// -------------------------------
// Display Event Details
// -------------------------------
function displayEventDetails(event) {
  document.title = `${event.event_name} - TixMaster`;

  document.getElementById("eventImage").src =
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800";

  document.getElementById("eventCategory").textContent =
    event.category?.category_name || "Event";

  document.getElementById("eventName").textContent = event.event_name;
  document.getElementById("eventDescription").textContent = event.description;

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
    ? `${event.venue.venue_name}, ${event.venue.address}`
    : "Venue not available";

  document.getElementById("eventOrganizer").textContent =
    event.organizer_name || "Organizer";
}

// -------------------------------
// Ticket Options
// -------------------------------
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
            onclick="addToCart(${t.ticket_id}, '${t.ticket_type}', ${t.price}, ${EVENT_DETAILS_CACHE.event_id})">
            Select
          </button>
        </div>
      </div>
    `
    )
    .join("");
}

// ============================================================
// ADD TO CART
// ============================================================
function addToCart(ticketId, type, price, eventId) {
  if (!localStorage.getItem("authToken")) {
    window.location.href = "login.html";
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  // ALWAYS include ticket_type and fallback
  const item = {
    ticket_id: ticketId,
    event_id: eventId,
    event_name: EVENT_DETAILS_CACHE.event_name,
    ticket_type: type || "General Admission",
    price: Number(price),
    quantity: 1
  };

  cart.push(item);

  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartIcon();

  alert(`Added 1 × ${item.ticket_type} to cart.`);
}



// -------------------------------
// Update Cart Icon Count
// -------------------------------
function updateCartIcon() {
  const cartIcon = document.getElementById("cartIcon");
  const cartCount = document.getElementById("cartCount");

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.length;

  if (count > 0) {
    cartIcon.style.display = "inline-flex";
    cartCount.textContent = count;
  } else {
    cartIcon.style.display = "none";
  }
}

// Run on page load
document.addEventListener("DOMContentLoaded", () => {
  loadEventDetails();
  setTimeout(updateCartIcon, 300); // small delay so navbar loads first
});
