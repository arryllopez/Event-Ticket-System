// ============================================================
// CATEGORY PAGE - API INTEGRATION GUIDE
// ============================================================
// This page displays events filtered by category, location, and date
// Connect to your database API to fetch filtered results
// ============================================================


// Get URL parameters
function getURLParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// API INTEGRATION: Fetch events by category with filters
// SQL QUERY:
//   SELECT e.event_id, e.event_name, e.event_date, e.description,
//          v.venue_name, v.city, c.category_name,
//          MIN(t.price) as min_price
//   FROM EVENT e
//   JOIN VENUE v ON e.venue_id = v.venue_id
//   JOIN CATEGORY c ON e.category_id = c.category_id
//   JOIN TICKET t ON e.event_id = t.event_id
//   WHERE (c.category_name = ? OR ? = 'All')
//     AND (v.city = ? OR ? IS NULL)
//     AND e.status = 'Upcoming'
//   GROUP BY e.event_id
//   ORDER BY e.event_date ASC
async function loadCategoryEvents() {
  const category = getURLParameter('category') || 'All';
  const location = document.getElementById('locationFilterPage').value;
  const dateRange = document.getElementById('dateFilterPage').value;
  const sort = document.getElementById('sortFilter').value;
  
  try {
    // Update page title
    document.getElementById('categoryTitle').textContent = 
      category === 'All' ? 'All Events' : `${category} Events`;
    document.getElementById('categoryDescription').textContent = 
      category === 'All' ? 'Browse all upcoming events' : `Explore ${category.toLowerCase()} events`;
    
    // ===== API INTEGRATION POINT =====
    // TODO: Replace with actual API call
    // const queryParams = new URLSearchParams({
    //   category: category,
    //   location: location,
    //   dateRange: dateRange,
    //   sort: sort
    // });
    // const response = await fetch(`YOUR_API_URL/api/events/category?${queryParams}`);
    // if (!response.ok) throw new Error('Failed to fetch events');
    // const events = await response.json();
    // ===== END API INTEGRATION POINT =====
    
    // For now, use sample data
    const sampleEventsData = [
      {
        event_id: 1,
        event_name: 'Rock Legends Live',
        event_date: '2025-12-15T19:00:00',
        description: 'Classic rock tribute concert',
        category: { category_name: 'Concerts' },
        venue: { venue_name: 'Grand Arena', city: 'Toronto' },
        tickets: [{ price: 75.00 }]
      },
      {
        event_id: 5,
        event_name: 'Comedy Night Special',
        event_date: '2025-11-25T21:00:00',
        description: 'Stand-up comedy showcase',
        category: { category_name: 'Comedy' },
        venue: { venue_name: 'City Theater', city: 'Toronto' },
        tickets: [{ price: 35.00 }]
      },
      {
        event_id: 3,
        event_name: 'Shakespeare Festival',
        event_date: '2025-11-10T20:00:00',
        description: 'A Midsummer Nights Dream',
        category: { category_name: 'Theater' },
        venue: { venue_name: 'City Theater', city: 'Toronto' },
        tickets: [{ price: 40.00 }]
      },
      {
        event_id: 2,
        event_name: 'Basketball Championship',
        event_date: '2025-11-20T18:30:00',
        description: 'Regional basketball finals',
        category: { category_name: 'Sports' },
        venue: { venue_name: 'Sports Complex', city: 'Mississauga' },
        tickets: [{ price: 45.00 }]
      }
    ];
    
    // Filter by category
    let filteredEvents = sampleEventsData;
    if (category !== 'All') {
      filteredEvents = filteredEvents.filter(e => e.category.category_name === category);
    }
    
    // Filter by location
    if (location) {
      filteredEvents = filteredEvents.filter(e => e.venue.city === location);
    }
    
    // Apply sorting
    filteredEvents = sortEvents(filteredEvents, sort);
    
    // Display results
    displayResults(filteredEvents);
    
  } catch (error) {
    console.error('Error loading events:', error);
    document.getElementById('resultsCount').textContent = 'Failed to load events.';
  }
}

// Sort events based on selected option
function sortEvents(events, sortOption) {
  const sorted = [...events];
  
  switch(sortOption) {
    case 'date-asc':
      return sorted.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
    case 'price-asc':
      return sorted.sort((a, b) => Math.min(...a.tickets.map(t => t.price)) - Math.min(...b.tickets.map(t => t.price)));
    case 'price-desc':
      return sorted.sort((a, b) => Math.min(...b.tickets.map(t => t.price)) - Math.min(...a.tickets.map(t => t.price)));
    case 'name-asc':
      return sorted.sort((a, b) => a.event_name.localeCompare(b.event_name));
    default:
      return sorted;
  }
}

// Display filtered results
function displayResults(events) {
  const grid = document.getElementById('categoryEventsGrid');
  const noResults = document.getElementById('noResults');
  const resultsCount = document.getElementById('resultsCount');
  
  if (events.length === 0) {
    grid.style.display = 'none';
    noResults.style.display = 'block';
    resultsCount.textContent = 'No events found';
    return;
  }
  
  grid.style.display = 'grid';
  noResults.style.display = 'none';
  resultsCount.textContent = `Showing ${events.length} event${events.length !== 1 ? 's' : ''}`;
  
  // Render event cards (reuse the rendering logic from script.js)
  grid.innerHTML = events.map(event => {
    const minPrice = Math.min(...event.tickets.map(t => t.price));
    const date = new Date(event.event_date);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    return `
      <div class="event-card" onclick="window.location.href='event-details.html?id=${event.event_id}'">
        <div class="event-image-container">
          <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop" alt="${event.event_name}" class="event-image">
          <div class="event-category">${event.category.category_name}</div>
        </div>
        <div class="event-content">
          <h3 class="event-title">${event.event_name}</h3>
          <div class="event-details">
            <div class="event-detail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>${event.venue.venue_name}, ${event.venue.city}</span>
            </div>
            <div class="event-detail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>${formattedDate}</span>
            </div>
          </div>
          <div class="event-footer">
            <span class="event-price">From $${minPrice.toFixed(2)}</span>
            <button class="btn-event" onclick="event.stopPropagation(); window.location.href='event-details.html?id=${event.event_id}'">Get Tickets</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Apply filters button
function applyFilters() {
  loadCategoryEvents();
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  loadCategoryEvents();
  
  // Add event listeners for filter changes
  document.getElementById('sortFilter').addEventListener('change', loadCategoryEvents);
});
