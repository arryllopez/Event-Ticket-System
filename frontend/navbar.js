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
