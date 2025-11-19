// ============================================================
// GLOBAL CONFIG
// ============================================================
const API_BASE = window.API_BASE || "http://127.0.0.1:5000/api";

// Helper to format dates
function formatEventDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getMinPrice(tickets) {
  if (!tickets || tickets.length === 0) return 0;
  return Math.min(...tickets.map(t => parseFloat(t.price)));
}

function getEventImage(categoryName) {
  const map = {
    Concert: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
    Sports: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    Theater: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800",
    Comedy: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800",
    Conference: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    Festival: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
  };
  return map[categoryName] || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800";
}

function updateAuthUI() {
  const token = localStorage.getItem("authToken");

  const loginBtns = document.querySelectorAll(".btn-login");
  const logoutBtns = document.querySelectorAll(".btn-logout");

  if (token) {
    loginBtns.forEach(btn => (btn.style.display = "none"));
    logoutBtns.forEach(btn => (btn.style.display = "block"));
  } else {
    loginBtns.forEach(btn => (btn.style.display = "block"));
    logoutBtns.forEach(btn => (btn.style.display = "none"));
  }
}




// ============================================================
// RENDER EVENTS
// ============================================================
function renderEvents(events) {
  const grid = document.getElementById("eventsGrid");

  if (!events || events.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:gray;">No events found.</p>`;
    return;
  }

  grid.innerHTML = events
    .map(event => {
      const minPrice = getMinPrice(event.tickets || []);
      const formattedDate = formatEventDate(event.event_date);
      const eventImg = getEventImage(event.category.category_name);

      return `
      <div class="event-card">
        <div class="event-image-container">
          <img src="${eventImg}" class="event-image">
          <div class="event-category">${event.category.category_name}</div>
        </div>
        <div class="event-content">
          <h3 class="event-title">${event.event_name}</h3>
          <div class="event-details">
            <div class="event-detail">
                <span>${event.venue.venue_name}, ${event.venue.city}</span>
            </div>
            <div class="event-detail">
                <span>${formattedDate}</span>
            </div>
          </div>
          <div class="event-footer">
            <span class="event-price">From $${minPrice.toFixed(2)}</span>
            <button class="btn-event" onclick="viewEvent(${event.event_id})">Get Tickets</button>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

// ============================================================
// FETCH EVENTS (HOME PAGE)
// ============================================================
async function fetchEventsFromAPI() {
  const grid = document.getElementById("eventsGrid");
  grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;">Loading...</p>`;

  try {
    const res = await fetch(`${API_BASE}/events/`);
    const events = await res.json();

    const upcoming = events.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    for (let event of upcoming) {
      const tRes = await fetch(`${API_BASE}/event-tickets/${event.event_id}`);
      event.tickets = await tRes.json();

      const eRes = await fetch(`${API_BASE}/events/${event.event_id}`);
      const fullData = await eRes.json();
      event.venue = fullData.venue;
      event.category = fullData.category;
    }

    renderEvents(upcoming.slice(0, 6));
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p style="color:red;">Failed to load events.</p>`;
  }
}

// ============================================================
// VIEW EVENT
// ============================================================
function viewEvent(id) {
  window.location.href = `event-details.html?id=${id}`;
}

// ============================================================
// SEARCH + FILTERS (WITH QUICK SEARCH RESTORED)
// ============================================================
async function searchEvents() {
  const q = document.getElementById("searchInput").value;
  const location = document.getElementById("locationFilter").value;
  const date = document.getElementById("dateFilter").value;

  const url = new URL(`${API_BASE}/events/filter`);

  if (q) url.searchParams.append("q", q);
  if (location) url.searchParams.append("location", location);
  if (date) url.searchParams.append("date", date);

  const response = await fetch(url);
  const data = await response.json();

  renderEvents(data);
}

function quickSearch(keyword) {
  document.getElementById("searchInput").value = keyword;
  searchEvents();
}

// ============================================================
// CATEGORY COUNTS
// ============================================================
async function loadCategoryCounts() {
  const res = await fetch(`${API_BASE}/categories/`);
  const categories = await res.json();

  const eventsRes = await fetch(`${API_BASE}/events/`);
  const events = await eventsRes.json();

  const counts = {};
  for (let c of categories) counts[c.category_name] = 0;

  for (let e of events) {
    const catObj = categories.find(c => c.category_id === e.category_id);
    if (catObj) counts[catObj.category_name]++;
  }

  document.getElementById("concertsCount").textContent = `${counts.Concert || 0} events`;
  document.getElementById("sportsCount").textContent = `${counts.Sports || 0} events`;
  document.getElementById("theaterCount").textContent = `${counts.Theater || 0} events`;
  document.getElementById("comedyCount").textContent = `${counts.Comedy || 0} events`;
  document.getElementById("conferencesCount").textContent = `${counts.Conference || 0} events`;
  document.getElementById("festivalsCount").textContent = `${counts.Festival || 0} events`;
}

// ============================================================
// PAGE INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  fetchEventsFromAPI();
  loadCategoryCounts();
  updateAuthUI();

  document.getElementById("searchInput").addEventListener("keypress", e => {
    if (e.key === "Enter") searchEvents();
  });
});

// EXPORT for debugging if needed
window.quickSearch = quickSearch;
window.searchEvents = searchEvents;
window.viewEvent = viewEvent;
