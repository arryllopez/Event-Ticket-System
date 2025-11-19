document.addEventListener("DOMContentLoaded", async () => {
    const authButtons = document.getElementById("authButtons");
    const cartIcon = document.getElementById("cartIcon");
    const cartCountEl = document.getElementById("cartCount");

    let user = null;

    // Try to fetch user (may 401 if logged out)
    try {
        user = await fetchCurrentUser();
    } catch (err) {
        user = null;
    }

    // ---------- NOT LOGGED IN ----------
    if (!user || user.error || user.msg) {
        authButtons.innerHTML = `
            <button class="btn-secondary" onclick="window.location.href='login.html'">Sign In</button>
        `;

        // Hide cart completely
        if (cartIcon) cartIcon.style.display = "none";

        return;
    }

    // ---------- LOGGED IN ----------
    authButtons.innerHTML = `
        <span class="user-greeting">Hello, ${user.first_name} ${user.last_name}</span>
        <button class="btn-secondary" onclick="logout()">Logout</button>
        ${
            user.role === "admin"
            ? `<button class="btn-primary" onclick="window.location.href='admin-dashboard.html'">Admin Panel</button>`
            : `<button class="btn-primary" onclick="window.location.href='customer-dashboard.html'">My Tickets</button>`
        }
    `;

    // Enable cart icon for logged-in users
    if (cartIcon) {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const cartCount = cart.reduce((s, item) => s + item.quantity, 0);

        cartCountEl.textContent = cartCount;
        cartIcon.style.display = "inline-flex";
    }
});

function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authRole");
    localStorage.removeItem("authEmail");
    localStorage.removeItem("cart");
    window.location.reload();
}

// ---------- WEATHER ----------
async function loadNavbarWeather() {
  const API_KEY = "bb82621cf968e35ce7553f9735f9a69c";

  // Check if geolocation is available
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
          );
          const data = await res.json();

          document.getElementById("weatherCity").textContent = data.name;
          document.getElementById("weatherTemp").textContent = `${Math.round(data.main.temp)}°C`;
          document.getElementById("weatherIcon").src =
            `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
        } catch (err) {
          document.getElementById("weatherCity").textContent = "Weather N/A";
        }
      },
      (error) => {
        // Handle geolocation errors
        document.getElementById("weatherCity").textContent = "Location N/A";
        console.error("Error fetching location: ", error);
      }
    );
  } else {
    // Geolocation not supported
    document.getElementById("weatherCity").textContent = "Geo N/A";
  }
}


document.addEventListener("DOMContentLoaded", loadNavbarWeather);
