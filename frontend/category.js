// ============================================================
// CATEGORY PAGE - FULL API INTEGRATION
// ============================================================
const API_BASE = "http://127.0.0.1:5000/api";

// Helper utilities
function getURLParameter(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatEventDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getMinPrice(tickets) {
  if (!tickets || tickets.length === 0) return 0;
  return Math.min(...tickets.map(t => parseFloat(t.price)));
}

// ============================================================
// FETCH ALL EVENTS + ATTACH NEEDED DATA
// ============================================================
async function fetchAllEvents() {
  const response = await fetch(`${API_BASE}/events/`);
  const events = await response.json();

  // Attach venue, category, tickets
  for (let e of events) {
    const detail = await (await fetch(`${API_BASE}/events/${e.event_id}`)).json();
    e.category = detail.category;
    e.venue = detail.venue;

    e.tickets = await (await fetch(`${API_BASE}/event-tickets/${e.event_id}`)).json();
  }

  return events;
}

// ============================================================
// FILTERING LOGIC
// ============================================================
function filterByCategory(events, selectedCategory) {
  if (selectedCategory === "All") return events;
  return events.filter(e => e.category.category_name === selectedCategory);
}

function filterByLocation(events, location) {
  if (!location) return events;
  return events.filter(e => e.venue.city === location);
}

function filterByDate(events, range) {
  if (!range) return events;

  const now = new Date();
  let max;

  switch (range) {
    case "today":
      return events.filter(e => {
        const d = new Date(e.event_date);
        return d.toDateString() === now.toDateString();
      });

    case "week":
      max = new Date();
      max.setDate(now.getDate() + 7);
      return events.filter(e => new Date(e.event_date) <= max);

    case "month":
      max = new Date();
      max.setMonth(now.getMonth() + 1);
      return events.filter(e => new Date(e.event_date) <= max);

    case "year":
      max = new Date();
      max.setFullYear(now.getFullYear() + 1);
      return events.filter(e => new Date(e.event_date) <= max);
  }
}

function sortEvents(events, sortOption) {
  const sorted = [...events];

  switch (sortOption) {
    case "date-asc":
      return sorted.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    case "date-desc":
      return sorted.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
    case "price-asc":
      return sorted.sort((a, b) => getMinPrice(a.tickets) - getMinPrice(b.tickets));
    case "price-desc":
      return sorted.sort((a, b) => getMinPrice(b.tickets) - getMinPrice(a.tickets));
    case "name-asc":
      return sorted.sort((a, b) => a.event_name.localeCompare(b.event_name));
    case "tickets-sold-desc":
      return sorted.sort((a, b) => {
        const aSold = a.tickets ? a.tickets.reduce((sum, t) => sum + (t.sold || 0), 0) : 0;
        const bSold = b.tickets ? b.tickets.reduce((sum, t) => sum + (t.sold || 0), 0) : 0;
      return bSold - aSold;
    });
    case "category-tickets-sold-desc":
      return sortByCategoryTicketsSold(events);
    default:
      return sorted;
  }
}

// ============================================================
// RENDER EVENT CARDS
// ============================================================
function renderEventCards(events) {
  const grid = document.getElementById("categoryEventsGrid");
  const resultsCount = document.getElementById("resultsCount");
  const noResults = document.getElementById("noResults");

  if (!events || events.length === 0) {
    grid.innerHTML = "";
    noResults.style.display = "block";
    resultsCount.textContent = "No events found";
    return;
  }

  noResults.style.display = "none";
  resultsCount.textContent = `Showing ${events.length} event(s)`;

  grid.innerHTML = events
    .map(event => {
      const minPrice = getMinPrice(event.tickets);
      const formattedDate = formatEventDate(event.event_date);

      return `
      <div class="event-card" onclick="window.location.href='event-details.html?id=${event.event_id}'">
        <div class="event-image-container">
          <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800" class="event-image">
          <div class="event-category">
            ${event.category?.category_name || "Uncategorized"}
          </div>
        </div>

        <div class="event-content">
          <h3 class="event-title">${event.event_name}</h3>

          <div class="event-details">
            <div class="event-detail">
              <span>${event.venue?.venue_name || "Unknown Venue"}, ${event.venue?.city || ""}</span>
            </div>
            <div class="event-detail">
              <span>${formattedDate}</span>
            </div>
          </div>

          <div class="event-footer">
            <span class="event-price">From $${(minPrice || 0).toFixed(2)}</span>
            <button class="btn-event">Get Tickets</button>
          </div>
        </div>
      </div>
      `;
    })
    .join("");
}

function aggregateTicketsSoldByCategory(events) {
  const categoryTicketsMap = new Map();

  events.forEach(event => {
    const catName = event.category?.category_name || "Uncategorized";
    // Sum total sold tickets per event, assuming tickets array has sold property or fallback 0
    const ticketsSold = event.tickets ? event.tickets.reduce((sum, t) => sum + (t.sold || 0), 0) : 0;

    categoryTicketsMap.set(catName, (categoryTicketsMap.get(catName) || 0) + ticketsSold);
  });

  return categoryTicketsMap;
}


function sortByCategoryTicketsSold(events) {
  // Get total tickets sold per category
  const categorySales = aggregateTicketsSoldByCategory(events);

  // Sort all events so those with categories having higher total sold come first
  return [...events].sort((a, b) => {
    const aCat = a.category?.category_name || "Uncategorized";
    const bCat = b.category?.category_name || "Uncategorized";

    // Descending sort by total tickets sold in the category
    return (categorySales.get(bCat) || 0) - (categorySales.get(aCat) || 0);
  });
}



async function loadUpcomingLowTickets() {
  const events = await fetchAllEvents(); // fetch all events with tickets data
  const filteredEvents = events.filter(e => {
    const remaining = e.tickets.reduce(
      (sum, t) => sum + (t.quantity_available - (t.tickets_sold || 0)),
      0
    );
    // Check remaining tickets and future date
    return remaining <= 500 && new Date(e.event_date) > new Date();
  });
  renderEventCards(filteredEvents); // or adapt to your render function
}



// ============================================================
// MAIN LOAD FUNCTION
// ============================================================
async function loadCategoryEvents() {
  const category = getURLParameter("category") || "All";
  const location = document.getElementById("locationFilterPage").value;
  const dateRange = document.getElementById("dateFilterPage").value;
  const sort = document.getElementById("sortFilter").value;

  document.getElementById("categoryTitle").textContent =
    category === "All" ? "All Events" : `${category} Events`;

  const events = await fetchAllEvents();

  // Basic filtering by category, location, and date
  let filtered = filterByCategory(events, category);
  filtered = filterByLocation(filtered, location);
  filtered = filterByDate(filtered, dateRange);

  // Special case for running out of tickets filter
  if (sort === "low-tickets-remaining") {
    filtered = filtered.filter(e => {
      const remainingTickets = e.tickets.reduce(
        (sum, t) => sum + (t.quantity_available - (t.sold || 0)),
        0
      );
      const eventDate = new Date(e.event_date);
      const now = new Date();
      return remainingTickets <= 500 && eventDate >= now;
    });
  } else {
    // Regular sorting
    filtered = sortEvents(filtered, sort);
  }

  renderEventCards(filtered);
}


document.addEventListener("DOMContentLoaded", () => {
  loadCategoryEvents();

  document.getElementById("sortFilter").addEventListener("change", loadCategoryEvents);
});

//applying filters button
window.applyFilters = function () {
  loadCategoryEvents();
};