// ============================================================
// EVENT DETAILS PAGE - API INTEGRATION GUIDE
// ============================================================
// This page displays full event details and ticket purchasing options
// Connect to your database to fetch event and ticket data
// ============================================================

// Get event ID from URL
function getEventId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// API INTEGRATION: Load full event details
// SQL QUERY:
//   SELECT e.event_id, e.event_name, e.event_date, e.description, 
//          e.organizer_name, e.status,
//          v.venue_name, v.city, v.address, v.capacity,
//          c.category_name
//   FROM EVENT e
//   JOIN VENUE v ON e.venue_id = v.venue_id
//   JOIN CATEGORY c ON e.category_id = c.category_id
//   WHERE e.event_id = ?
async function loadEventDetails() {
  const eventId = getEventId();
  
  if (!eventId) {
    alert('Event not found!');
    window.location.href = 'index.html';
    return;
  }
  
  try {
    // ===== API INTEGRATION POINT =====
    // TODO: Replace with actual API call
    // const response = await fetch(`YOUR_API_URL/api/events/${eventId}`);
    // if (!response.ok) throw new Error('Event not found');
    // const event = await response.json();
    // ===== END API INTEGRATION POINT =====
    
    // Sample event data
    const event = {
      event_id: eventId,
      event_name: 'Rock Legends Live',
      event_date: '2025-12-15T19:00:00',
      description: 'Experience an unforgettable night of classic rock music featuring tribute performances from legendary bands. This high-energy concert will transport you back to the golden age of rock and roll.',
      organizer_name: 'LiveNation Events',
      status: 'Upcoming',
      category: { category_name: 'Concert' },
      venue: {
        venue_name: 'Grand Arena',
        city: 'Toronto',
        address: '123 Main Street, Toronto, ON'
      },
      tickets: [
        { ticket_id: 1, ticket_type: 'General Admission', price: 75.00, quantity_available: 3500 },
        { ticket_id: 2, ticket_type: 'VIP', price: 150.00, quantity_available: 1500 },
        { ticket_id: 3, ticket_type: 'Premium Floor', price: 250.00, quantity_available: 500 }
      ]
    };
    
    // Display event details
    displayEventDetails(event);
    
    // Load ticket options
    loadTicketOptions(event.tickets);
    
  } catch (error) {
    console.error('Error loading event:', error);
    alert('Failed to load event details.');
    window.location.href = 'index.html';
  }
}

// Display event information
function displayEventDetails(event) {
  document.title = `${event.event_name} - TixMaster`;
  
  // Set image
  document.getElementById('eventImage').src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop';
  document.getElementById('eventImage').alt = event.event_name;
  
  // Set basic info
  document.getElementById('eventCategory').textContent = event.category.category_name;
  document.getElementById('eventName').textContent = event.event_name;
  document.getElementById('eventDescription').textContent = event.description;
  
  // Format and set date/time
  const eventDate = new Date(event.event_date);
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  const formattedDate = eventDate.toLocaleDateString('en-US', dateOptions);
  const formattedTime = eventDate.toLocaleTimeString('en-US', timeOptions);
  document.getElementById('eventDateTime').textContent = `${formattedDate} at ${formattedTime}`;
  
  // Set venue
  document.getElementById('eventVenue').textContent = `${event.venue.venue_name}\n${event.venue.address}`;
  
  // Set organizer
  document.getElementById('eventOrganizer').textContent = event.organizer_name;
}

// API INTEGRATION: Load available ticket options
// SQL QUERY:
//   SELECT ticket_id, ticket_type, price, quantity_available
//   FROM TICKET
//   WHERE event_id = ? AND quantity_available > 0
//   ORDER BY price ASC
function loadTicketOptions(tickets) {
  const ticketOptionsContainer = document.getElementById('ticketOptions');
  
  if (!tickets || tickets.length === 0) {
    ticketOptionsContainer.innerHTML = '<p style="color: var(--text-secondary);">No tickets available at this time.</p>';
    return;
  }
  
  ticketOptionsContainer.innerHTML = tickets.map(ticket => `
    <div class="ticket-option">
      <div class="ticket-info">
        <h4>${ticket.ticket_type}</h4>
        <p>${ticket.quantity_available} tickets available</p>
      </div>
      <div class="ticket-price">
        <div class="price">$${ticket.price.toFixed(2)}</div>
        <button class="btn-primary" onclick="purchaseTicket(${ticket.ticket_id}, '${ticket.ticket_type}', ${ticket.price})" style="margin-top: 8px;">
          Select
        </button>
      </div>
    </div>
  `).join('');
}

// API INTEGRATION: Purchase ticket
// This should redirect to a checkout page or open a purchase modal
// SQL QUERIES (in checkout process):
//   1. Check ticket availability:
//      SELECT quantity_available FROM TICKET WHERE ticket_id = ? FOR UPDATE
//   2. Create purchase record:
//      INSERT INTO PURCHASE (customer_id, ticket_id, quantity, purchase_date, total_amount, status)
//      VALUES (?, ?, ?, NOW(), ?, 'Confirmed')
//   3. Update ticket quantity:
//      UPDATE TICKET SET quantity_available = quantity_available - ? WHERE ticket_id = ?
function purchaseTicket(ticketId, ticketType, price) {
  // ===== API INTEGRATION POINT =====
  // TODO: Implement actual purchase flow
  // Options:
  // 1. Redirect to checkout page: window.location.href = `checkout.html?ticketId=${ticketId}&qty=1`
  // 2. Open purchase modal with payment form
  // 3. Add to cart and continue shopping
  // ===== END API INTEGRATION POINT =====
  
  // For now, show confirmation dialog
  const confirmed = confirm(
    `Purchase Ticket?\n\n` +
    `Type: ${ticketType}\n` +
    `Price: $${price.toFixed(2)}\n\n` +
    `This will redirect to checkout page when connected to your database.`
  );
  
  if (confirmed) {
    // TODO: Redirect to checkout or process payment
    alert('Connect your database and payment processor to complete purchases!');
    // window.location.href = `checkout.html?ticketId=${ticketId}`;
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  loadEventDetails();
});
