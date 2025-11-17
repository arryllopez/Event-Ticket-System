// ======================================================
// LOGIN PAGE HANDLER
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const msg = document.getElementById("loginMessage");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg.textContent = "";

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            // Use the correct API helper
            const data = await loginCustomer(email, password);

            if (!data || !data.token) {
                msg.textContent = "Login failed.";
                return;
            }

            // Fetch /me using the stored token
            const user = await fetchCurrentUser();

            if (!user) {
                msg.textContent = "Could not load user data.";
                return;
            }

            // Redirect based on role
            if (user.role === "admin") {
                window.location.href = "admin-dashboard.html";
            } else {
                window.location.href = "index.html";
            }

        } catch (err) {
            msg.textContent = "Network error. Try again.";
            console.error(err);
        }
    });
});



