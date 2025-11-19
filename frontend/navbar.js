document.addEventListener("DOMContentLoaded", async () => {
    const authButtons = document.getElementById("authButtons");

    try {
        const user = await fetchCurrentUser(); // /me

        if (!user || !user.first_name) {
            // Not logged in
            authButtons.innerHTML = `
                <button class="btn-secondary" onclick="window.location.href='login.html'">Sign In</button>
                <button class="btn-primary" onclick="window.location.href='sell-tickets.html'">Sell Tickets</button>
            `;
            return;
        }

        // Logged in user
        authButtons.innerHTML = `
            <span class="user-greeting">Hello, ${user.first_name} ${user.last_name}</span>
            <button class="btn-secondary" onclick="logout()">Logout</button>
            ${user.role === "admin" ? `
                <button class="btn-primary" onclick="window.location.href='admin-dashboard.html'">Admin Panel</button>
            ` : ""}
        `;
    } catch (err) {
        console.error("Navbar user load failed:", err);
    }
});

function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authRole");
    localStorage.removeItem("authEmail");
    window.location.reload();
}


async function loadNavbarWeather() {
    const API_KEY = "bb82621cf968e35ce7553f9735f9a69c".trim(); 
    const city = "Toronto";

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        const data = await res.json();

        document.getElementById("weatherCity").textContent = city;
        document.getElementById("weatherTemp").textContent = `${Math.round(data.main.temp)}°C`;
        document.getElementById("weatherIcon").src =
            `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    } catch (err) {
        console.error("Weather error:", err);
        document.getElementById("weatherCity").textContent = "Weather N/A";
    }
}

document.addEventListener("DOMContentLoaded", loadNavbarWeather);
