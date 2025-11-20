document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const first_name = document.getElementById("first_name").value.trim();
    const last_name = document.getElementById("last_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const res = await fetch("http://127.0.0.1:5000/api/auth/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({first_name, last_name, email, password})
        });

        const data = await res.json();

        if (!res.ok) {
            document.getElementById("registerError").textContent = data.error || "Registration failed";
            document.getElementById("registerError").style.display = "block";
            return;
        }

        alert("Account created successfully! You can now log in.");
        window.location.href = "login.html";

    } catch (err) {
        console.error(err);
    }
});
