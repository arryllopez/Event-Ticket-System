// ============================================================
// API Configuration
// ============================================================

const API_BASE_URL = "http://localhost:5000/api";

const API_ENDPOINTS = {
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    me: `${API_BASE_URL}/auth/me`,
  },

  admin: {
    getMyEvents: `${API_BASE_URL}/admin/events`,
    createEvent: `${API_BASE_URL}/admin/events`,
    updateEvent: (id) => `${API_BASE_URL}/admin/events/${id}`,
    deleteEvent: (id) => `${API_BASE_URL}/admin/events/${id}`,
  },

 events: {
    getAll: `${API_BASE_URL}/events`,
    getById: (id) => `${API_BASE_URL}/events/${id}`,   
},


  purchases: {
    create: `${API_BASE_URL}/purchases`,
    getMine: `${API_BASE_URL}/purchases`,
  },

  tickets: {
    myTickets: `${API_BASE_URL}/tickets`,
  },

  export: {
    purchases: `${API_BASE_URL}/export/purchases`,
  },

  weather: {
    byCity: (city) => `${API_BASE_URL}/weather/${encodeURIComponent(city)}`,
    byEvent: (eventId) => `${API_BASE_URL}/weather/event/${eventId}`,
  },
};

// ============================================================
// API Helper Functions
// ============================================================

async function apiRequest(url, options = {}) {
  try {
    const token = localStorage.getItem("authToken");

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("API error body:", text);
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    if (response.status === 204) return null;

    return await response.json();
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
}

// ============================================================
// Authentication
// ============================================================

async function registerCustomer(customerData) {
  return await apiRequest(API_ENDPOINTS.auth.register, {
    method: "POST",
    body: JSON.stringify(customerData),
  });
}

async function loginCustomer(email, password) {
  const data = await apiRequest(API_ENDPOINTS.auth.login, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (data && data.token) {
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("authRole", data.role || "user");
    localStorage.setItem("authEmail", data.email || "");
  }

  return data;
}

async function fetchCurrentUser() {
  return await apiRequest(API_ENDPOINTS.auth.me);
}

// ============================================================
// Events
// ============================================================

async function fetchAllEvents() {
  return await apiRequest(API_ENDPOINTS.events.getAll);
}

async function fetchEventById(eventId) {
  return await apiRequest(API_ENDPOINTS.events.getById(eventId));
}

async function fetchAdminEvents() {
  return await apiRequest(API_ENDPOINTS.admin.getMyEvents);
}

// ============================================================
// Purchases / Tickets
// ============================================================

async function createPurchase(purchaseData) {
  return await apiRequest(API_ENDPOINTS.purchases.create, {
    method: "POST",
    body: JSON.stringify(purchaseData),
  });
}

async function fetchMyPurchases() {
  return await apiRequest(API_ENDPOINTS.purchases.getMine);
}

async function fetchMyTickets() {
  return await apiRequest(API_ENDPOINTS.tickets.myTickets);
}
