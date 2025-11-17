document.addEventListener("DOMContentLoaded", () => {
  initAdminDashboard();
});

async function initAdminDashboard() {
  const statusEl = document.getElementById("adminStatus");
  const tableEl = document.getElementById("adminEventsTable");
  const tbodyEl = document.getElementById("adminEventsBody");
  const emptyEl = document.getElementById("adminEmpty");
  const userInfoEl = document.getElementById("adminUserInfo");

  try {
    // 1) Fetch current user
    const me = await fetchCurrentUser();

    if (!me || me.role !== "admin") {
      statusEl.textContent =
        "You are not an admin. Log in with an organizer account (email matching EVENT.organizer_email).";
      tableEl.style.display = "none";
      emptyEl.style.display = "block";
      userInfoEl.textContent = "";
      return;
    }

    userInfoEl.textContent = `${me.first_name || ""} ${me.last_name || ""} · ${
      me.email || ""
    } (role: ${me.role})`;

    // 2) Fetch admin events
    const events = await fetchAdminEvents();

    if (!events || events.length === 0) {
      statusEl.textContent = "No events found for your email.";
      tableEl.style.display = "none";
      emptyEl.style.display = "block";
      return;
    }

    statusEl.textContent = `You are responsible for ${events.length} event${
      events.length !== 1 ? "s" : ""
    }.`;
    tableEl.style.display = "table";
    emptyEl.style.display = "none";

    // 3) Render rows
    tbodyEl.innerHTML = events
      .map((e) => {
        const date = new Date(e.event_date);
        const formattedDate = isNaN(date)
          ? e.event_date
          : date.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

        const statusClass = getStatusClass(e.status);

        return `
          <tr>
            <td>${e.event_id}</td>
            <td>${e.event_name}</td>
            <td>${formattedDate}</td>
            <td>
              <span class="status-pill ${statusClass}">
                ${e.status}
              </span>
            </td>
            <td>${e.total_tickets}</td>
            <td>${e.tickets_sold}</td>
            <td>${e.organizer_email || ""}</td>
          </tr>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Error loading admin dashboard:", err);
    statusEl.textContent =
      "Failed to load admin events. Make sure you are logged in.";
    tableEl.style.display = "none";
    emptyEl.style.display = "block";
  }
}

function getStatusClass(status) {
  if (!status) return "status-upcoming";
  switch (status.toLowerCase()) {
    case "upcoming":
      return "status-upcoming";
    case "ongoing":
      return "status-ongoing";
    case "completed":
      return "status-completed";
    case "cancelled":
      return "status-cancelled";
    default:
      return "status-upcoming";
  }
}
