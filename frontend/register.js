// Toast notification function
function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => toast.classList.add('show'), 100);

  // Hide toast and remove from DOM
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Register form submit event listener
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

    showToast("Account created successfully! You can now log in.");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 3000);

  } catch (err) {
    console.error(err);
  }
});
