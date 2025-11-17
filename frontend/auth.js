// ======================================================
// AUTH UTILITIES
// ======================================================

// Use API_BASE from api-config.js
// API_BASE = "http://127.0.0.1:5000/api";

// ------------------------------------------------------
// Save token
// ------------------------------------------------------
function saveToken(token) {
    localStorage.setItem("token", token);
}

// ------------------------------------------------------
// Logout
// ------------------------------------------------------
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

// ------------------------------------------------------
// Get saved user from localStorage
// ------------------------------------------------------
function getUser() {
    const raw = localStorage.getItem("user");
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

// ------------------------------------------------------
// Fetch user from backend using JWT token
// ------------------------------------------------------
async function fetchCurrentUser() {
    const token = localStorage.getItem("token");
    if (!token) {
        localStorage.removeItem("user");
        return null;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) {
            // expired token → clear
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return null;
        }

        const user = await res.json();
        localStorage.setItem("user", JSON.stringify(user));
        return user;

    } catch (err) {
        console.error("fetchCurrentUser() failed:", err);
        return null;
    }
}

// ------------------------------------------------------
// Update Header UI
// ------------------------------------------------------
async function updateAuthUI() {
    const container = document.getElementById("authButtons");
    if (!container) return;

    // ensure user data is fresh
    const user = await fetchCurrentUser();

    if (!user) {
        container.innerHTML = `
            <button class="btn-secondary" onclick="window.location.href='login.html'">Sign In</button>
            <button class="btn-primary" onclick="window.location.href='sell-tickets.html'">Sell Tickets</button>
        `;
        return;
    }

    container.innerHTML = `
        <span style="margin-right:15px;font-weight:600;">
            Hello, ${user.first_name} ${user.last_name}
        </span>

        <button class="btn-secondary" onclick="logout()">Logout</button>

        ${
            user.role === "admin"
            ? `<button class="btn-primary" onclick="window.location.href='admin.html'">Admin Panel</button>`
            : `<button class="btn-primary" onclick="window.location.href='sell-tickets.html'">Sell Tickets</button>`
        }
    `;
}

// ------------------------------------------------------
// Auto-run on page load
// ------------------------------------------------------
document.addEventListener("DOMContentLoaded", updateAuthUI);
