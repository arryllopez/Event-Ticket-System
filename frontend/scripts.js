// Sample event data - Replace this with your database API calls
const eventsData = [
  {
    id: 1,
    title: 'Summer Music Festival 2024',
    location: 'Madison Square Garden, NY',
    date: 'Jul 15, 2024',
    price: 'From $85',
    category: 'Concert',
    trending: true,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop'
  },
  {
    id: 2,
    title: 'NBA Finals Game 5',
    location: 'Staples Center, LA',
    date: 'Jun 20, 2024',
    price: 'From $250',
    category: 'Sports',
    trending: true,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop'
  },
  {
    id: 3,
    title: 'Hamilton on Broadway',
    location: 'Richard Rodgers Theatre',
    date: 'Aug 5, 2024',
    price: 'From $120',
    category: 'Theater',
    trending: false,
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop'
  },
  {
    id: 4,
    title: 'Rock Legends Tour',
    location: 'Red Rocks Amphitheatre',
    date: 'Sep 10, 2024',
    price: 'From $95',
    category: 'Concert',
    trending: true,
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop'
  },
  {
    id: 5,
    title: 'World Cup Qualifier',
    location: 'MetLife Stadium, NJ',
    date: 'Oct 12, 2024',
    price: 'From $65',
    category: 'Sports',
    trending: false,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop'
  },
  {
    id: 6,
    title: 'Jazz Night Under the Stars',
    location: 'Hollywood Bowl, CA',
    date: 'Aug 22, 2024',
    price: 'From $55',
    category: 'Concert',
    trending: false,
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=600&fit=crop'
  }
];

// Sample data for testing (matches your database structure)
// Remove this once your API is connected
const sampleEventsData = [
  {
    event_id: 1,
    event_name: 'Rock Legends Live',
    event_date: '2025-12-15T19:00:00',
    description: 'Classic rock tribute concert',
    organizer_name: 'LiveNation Events',
    status: 'Upcoming',
    category: {
      category_id: 1,
      category_name: 'Concert'
    },
    venue: {
      venue_name: 'Grand Arena',
      city: 'Toronto',
      address: '123 Main Street'
    },
    tickets: [
      { ticket_type: 'General Admission', price: 75.00, quantity_available: 3500 },
      { ticket_type: 'VIP', price: 150.00, quantity_available: 1500 },
      { ticket_type: 'Premium Floor', price: 250.00, quantity_available: 500 }
    ]
  },
  {
    event_id: 2,
    event_name: 'Basketball Championship',
    event_date: '2025-11-20T18:30:00',
    description: 'Regional basketball finals',
    organizer_name: 'Sports Management Inc',
    status: 'Upcoming',
    category: {
      category_id: 2,
      category_name: 'Sports'
    },
    venue: {
      venue_name: 'Sports Complex',
      city: 'Mississauga',
      address: '321 Stadium Road'
    },
    tickets: [
      { ticket_type: 'Upper Bowl', price: 45.00, quantity_available: 3000 },
      { ticket_type: 'Lower Bowl', price: 85.00, quantity_available: 1500 },
      { ticket_type: 'Courtside', price: 300.00, quantity_available: 500 }
    ]
  },
  {
    event_id: 3,
    event_name: 'Shakespeare Festival',
    event_date: '2025-11-10T20:00:00',
    description: 'A Midsummer Nights Dream',
    organizer_name: 'Theater Guild',
    status: 'Upcoming',
    category: {
      category_id: 3,
      category_name: 'Theater'
    },
    venue: {
      venue_name: 'City Theater',
      city: 'Toronto',
      address: '456 Queen Street West'
    },
    tickets: [
      { ticket_type: 'Standard Seating', price: 40.00, quantity_available: 100 },
      { ticket_type: 'Premium Seating', price: 65.00, quantity_available: 50 }
    ]
  },
  {
    event_id: 7,
    event_name: 'Jazz Evening',
    event_date: '2025-11-08T19:30:00',
    description: 'Smooth jazz performance',
    organizer_name: 'City Events',
    status: 'Upcoming',
    category: {
      category_id: 1,
      category_name: 'Concert'
    },
    venue: {
      venue_name: 'Community Center',
      city: 'Oshawa',
      address: '789 King Street'
    },
    tickets: [
      { ticket_type: 'General Admission', price: 30.00, quantity_available: 60 },
      { ticket_type: 'Table Seating', price: 55.00, quantity_available: 20 }
    ]
  },
  {
    event_id: 5,
    event_name: 'Comedy Night Special',
    event_date: '2025-11-25T21:00:00',
    description: 'Stand-up comedy showcase',
    organizer_name: 'Laugh Factory',
    status: 'Upcoming',
    category: {
      category_id: 5,
      category_name: 'Comedy'
    },
    venue: {
      venue_name: 'City Theater',
      city: 'Toronto',
      address: '456 Queen Street West'
    },
    tickets: [
      { ticket_type: 'General Seating', price: 35.00, quantity_available: 150 },
      { ticket_type: 'Front Row', price: 60.00, quantity_available: 50 }
    ]
  },
  {
    event_id: 4,
    event_name: 'Tech Innovation Summit',
    event_date: '2025-12-05T09:00:00',
    description: 'Annual technology conference',
    organizer_name: 'TechConnect',
    status: 'Upcoming',
    category: {
      category_id: 4,
      category_name: 'Conference'
    },
    venue: {
      venue_name: 'Convention Hall',
      city: 'Toronto',
      address: '654 Conference Drive'
    },
    tickets: [
      { ticket_type: 'Early Bird', price: 199.00, quantity_available: 800 },
      { ticket_type: 'Regular Pass', price: 299.00, quantity_available: 400 },
      { ticket_type: 'VIP Pass', price: 499.00, quantity_available: 100 }
    ]
  }
];

// ============================================================
// Helper Functions
// ============================================================

// Format date for display
function formatEventDate(dateString) {
  const date = new Date(dateString);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Get minimum ticket price
function getMinPrice(tickets) {
  if (!tickets || tickets.length === 0) return 0;
  const prices = tickets.map(t => parseFloat(t.price));
  return Math.min(...prices);
}

// Check if event is trending (example logic - customize as needed)
function isTrendingEvent(event) {
  // You can implement your own logic here
  // For example: check if tickets_sold is high, or event_date is soon
  return event.event_id === 1 || event.event_id === 2 || event.event_id === 7;
}

// Get placeholder image based on category
function getEventImage(categoryName) {
  const imageMap = {
    'Concert': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
    'Sports': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop',
    'Theater': 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop',
    'Conference': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    'Comedy': 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&h=600&fit=crop',
    'Festival': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop'
  };
  return imageMap[categoryName] || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop';
}

// ============================================================
// Render Functions
// ============================================================

// Render events to the grid
function renderEvents(events) {
  const eventsGrid = document.getElementById('eventsGrid');
  
  if (!events || events.length === 0) {
    eventsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No events found.</p>';
    return;
  }
  
  eventsGrid.innerHTML = events.map(event => {
    const minPrice = getMinPrice(event.tickets);
    const isTrending = isTrendingEvent(event);
    const eventImage = getEventImage(event.category.category_name);
    const formattedDate = formatEventDate(event.event_date);
    const location = `${event.venue.venue_name}, ${event.venue.city}`;
    
    return `
      <div class="event-card" data-event-id="${event.event_id}">
        ${isTrending ? `
          <div class="trending-badge">
            <svg class="trending-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            <span>Trending</span>
          </div>
        ` : ''}
        <div class="event-image-container">
          <img src="${eventImage}" alt="${event.event_name}" class="event-image">
          <div class="event-category">${event.category.category_name}</div>
        </div>
        <div class="event-content">
          <h3 class="event-title">${event.event_name}</h3>
          <div class="event-details">
            <div class="event-detail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>${location}</span>
            </div>
            <div class="event-detail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
            <button class="btn-event" onclick="viewEvent(${event.event_id})">Get Tickets</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// API Integration Functions
// ============================================================

// API INTEGRATION: Fetch featured/upcoming events from database
// SQL QUERY:
//   SELECT e.event_id, e.event_name, e.event_date, e.description, e.status,
//          v.venue_name, v.city, v.address,
//          c.category_name,
//          MIN(t.price) as min_price
//   FROM EVENT e
//   JOIN VENUE v ON e.venue_id = v.venue_id
//   JOIN CATEGORY c ON e.category_id = c.category_id
//   JOIN TICKET t ON e.event_id = t.event_id
//   WHERE e.event_date >= CURRENT_DATE AND e.status = 'Upcoming'
//   GROUP BY e.event_id
//   ORDER BY e.event_date ASC
//   LIMIT 6
async function fetchEventsFromAPI() {
  try {
    const eventsGrid = document.getElementById('eventsGrid');
    eventsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Loading events...</p>';
    
    // ===== API INTEGRATION POINT =====
    // TODO: Replace sample data with actual API call
    // const response = await fetch('YOUR_API_URL/api/events?limit=6&status=Upcoming');
    // if (!response.ok) throw new Error('Failed to fetch events');
    // const events = await response.json();
    // ===== END API INTEGRATION POINT =====
    
    // For now, use sample data
    const events = sampleEventsData;
    
    renderEvents(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    const eventsGrid = document.getElementById('eventsGrid');
    eventsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">Failed to load events. Please try again later.</p>';
  }
}

// API INTEGRATION: Fetch event by ID with full ticket information
// SQL QUERY:
//   SELECT e.*, v.*, c.*,
//          t.ticket_id, t.ticket_type, t.price, t.quantity_available
//   FROM EVENT e
//   JOIN VENUE v ON e.venue_id = v.venue_id
//   JOIN CATEGORY c ON e.category_id = c.category_id
//   LEFT JOIN TICKET t ON e.event_id = t.event_id
//   WHERE e.event_id = ?
async function viewEvent(eventId) {
  try {
    // ===== API INTEGRATION POINT =====
    // TODO: Replace with actual API call
    // const response = await fetch(`YOUR_API_URL/api/events/${eventId}`);
    // if (!response.ok) throw new Error('Event not found');
    // const event = await response.json();
    // ===== END API INTEGRATION POINT =====
    
    const event = sampleEventsData.find(e => e.event_id === eventId);
    
    if (!event) {
      alert('Event not found!');
      return;
    }
    
    // Navigate to event details page
    window.location.href = `event-details.html?id=${eventId}`;
    
  } catch (error) {
    console.error('Error viewing event:', error);
    alert('Failed to load event details. Please try again.');
  }
}

// API INTEGRATION: Search events with filters
// SQL QUERY:
//   SELECT e.*, v.venue_name, v.city, c.category_name, MIN(t.price) as min_price
//   FROM EVENT e
//   JOIN VENUE v ON e.venue_id = v.venue_id
//   JOIN CATEGORY c ON e.category_id = c.category_id
//   JOIN TICKET t ON e.event_id = t.event_id
//   WHERE (e.event_name LIKE '%?%' OR e.description LIKE '%?%')
//     AND (v.city = ? OR ? IS NULL)
//     AND (e.event_date >= ? OR ? IS NULL)
//   GROUP BY e.event_id
//   ORDER BY e.event_date ASC
async function searchEvents() {
  const searchInput = document.getElementById('searchInput');
  const locationFilter = document.getElementById('locationFilter');
  const dateFilter = document.getElementById('dateFilter');
  
  const searchTerm = searchInput.value.trim();
  const location = locationFilter.value;
  const dateRange = dateFilter.value;
  
  try {
    // ===== API INTEGRATION POINT =====
    // TODO: Replace with actual API call
    // const queryParams = new URLSearchParams({
    //   q: searchTerm,
    //   location: location,
    //   date: dateRange
    // });
    // const response = await fetch(`YOUR_API_URL/api/events/search?${queryParams}`);
    // if (!response.ok) throw new Error('Search failed');
    // const events = await response.json();
    // ===== END API INTEGRATION POINT =====
    
    // For now, filter sample data
    let filteredEvents = sampleEventsData;
    
    if (searchTerm) {
      filteredEvents = filteredEvents.filter(event => 
        event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.category_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (location) {
      filteredEvents = filteredEvents.filter(event => 
        event.venue.city === location
      );
    }
    
    renderEvents(filteredEvents);
  } catch (error) {
    console.error('Search error:', error);
    alert('Search failed. Please try again.');
  }
}

// API INTEGRATION: Quick search by keyword (popular tags)
async function quickSearch(keyword) {
  const searchInput = document.getElementById('searchInput');
  searchInput.value = keyword;
  await searchEvents();
}

// API INTEGRATION: Fetch category counts for homepage
// SQL QUERY:
//   SELECT c.category_name, COUNT(e.event_id) as event_count
//   FROM CATEGORY c
//   LEFT JOIN EVENT e ON c.category_id = e.category_id AND e.status = 'Upcoming'
//   GROUP BY c.category_id, c.category_name
async function loadCategoryCounts() {
  try {
    // ===== API INTEGRATION POINT =====
    // TODO: Replace with actual API call
    // const response = await fetch('YOUR_API_URL/api/categories/counts');
    // if (!response.ok) throw new Error('Failed to fetch categories');
    // const categories = await response.json();
    // ===== END API INTEGRATION POINT =====
    
    // For now, use sample counts
    const categoryCounts = {
      'Concerts': 1234,
      'Sports': 892,
      'Theater': 456,
      'Comedy': 234,
      'Conferences': 567,
      'Festivals': 189
    };
    
    // Update category counts on the page
    document.getElementById('concertsCount').textContent = `${categoryCounts.Concerts} events`;
    document.getElementById('sportsCount').textContent = `${categoryCounts.Sports} events`;
    document.getElementById('theaterCount').textContent = `${categoryCounts.Theater} events`;
    document.getElementById('comedyCount').textContent = `${categoryCounts.Comedy} events`;
    document.getElementById('conferencesCount').textContent = `${categoryCounts.Conferences} events`;
    document.getElementById('festivalsCount').textContent = `${categoryCounts.Festivals} events`;
    
  } catch (error) {
    console.error('Error loading category counts:', error);
  }
}

// ============================================================
// Search and Filter Functions
// ============================================================

// Search functionality
function setupSearch() {
  const searchInput = document.querySelector('.search-input');
  const searchButton = document.querySelector('.search-button');
  const locationSelect = document.querySelectorAll('.filter-select')[0];
  const dateSelect = document.querySelectorAll('.filter-select')[1];
  
  searchButton.addEventListener('click', searchEvents);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchEvents();
  });
}

// ============================================================
// UI Event Handlers
// ============================================================

// Header scroll effect
window.addEventListener('scroll', function() {
  const header = document.getElementById('header');
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');

mobileMenuBtn.addEventListener('click', function() {
  mobileMenuBtn.classList.toggle('active');
  mobileNav.classList.toggle('active');
});

// Close mobile menu when clicking on a link
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
mobileNavLinks.forEach(link => {
  link.addEventListener('click', function() {
    mobileMenuBtn.classList.remove('active');
    mobileNav.classList.remove('active');
  });
});

// ============================================================
// Page Initialization
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  // Load events on page load
  fetchEventsFromAPI();
  
  // Load category counts
  loadCategoryCounts();
  
  // Setup search functionality
  setupSearch();
  
  console.log('TixMaster initialized. Connect to your database API in api-config.js!');
});
