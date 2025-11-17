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
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                msg.textContent = data.error || "Login failed.";
                return;
            }

            // Save token
            saveToken(data.token);

            // Fetch user info
            const user = await fetchCurrentUser();

            if (!user) {
                msg.textContent = "Could not load user data.";
                return;
            }

            // Redirect to homepage
            window.location.href = "index.html";

        } catch (err) {
            msg.textContent = "Network error. Try again.";
            console.error(err);
        }
    });
});
