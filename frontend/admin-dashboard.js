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
    const me = await fetchCurrentUser();

    if (!me || me.role !== "admin") {
      statusEl.textContent = "You are not an admin.";
      tableEl.style.display = "none";
      emptyEl.style.display = "block";
      userInfoEl.textContent = "";
      return;
    }

    userInfoEl.textContent = `${me.first_name || ""} ${me.last_name || ""} · ${me.email || ""}`;

    const events = await fetchAdminEvents();
    window.adminEvents = events || [];

    if (!events || events.length === 0) {
      statusEl.textContent = "No events found.";
      tableEl.style.display = "none";
      emptyEl.style.display = "block";
      return;
    }

    statusEl.textContent = `You are responsible for ${events.length} event${events.length !== 1 ? "s" : ""}.`;
    tableEl.style.display = "table";
    emptyEl.style.display = "none";

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
            <td><span class="status-pill ${statusClass}">${e.status}</span></td>
            <td>${e.total_tickets}</td>
            <td>${e.tickets_sold}</td>
            <td>${e.organizer_email || ""}</td>
            <td>
              <button class="btn-small edit-btn" onclick="openEditEvent(${e.event_id})">Edit</button>
              <button class="btn-small delete-btn" onclick="deleteEvent(${e.event_id})">Delete</button>
            </td>
          </tr>
        `;
      })
      .join("");
  } catch (err) {
    statusEl.textContent = "Failed to load admin events.";
    tableEl.style.display = "none";
    emptyEl.style.display = "block";
  }
}

function getStatusClass(status) {
  if (!status) return "status-upcoming";
  switch (status.toLowerCase()) {
    case "upcoming": return "status-upcoming";
    case "ongoing": return "status-ongoing";
    case "completed": return "status-completed";
    case "cancelled": return "status-cancelled";
    default: return "status-upcoming";
  }
}

function openCreateEvent() {
  document.getElementById("modalTitle").textContent = "Create Event";
  document.getElementById("eventId").value = "";
  document.getElementById("eventForm").reset();
  document.getElementById("eventModal").classList.remove("hidden");
}

function openEditEvent(id) {
  const e = window.adminEvents.find(x => x.event_id === id);
  document.getElementById("modalTitle").textContent = "Edit Event";
  document.getElementById("eventId").value = id;
  document.getElementById("eventName").value = e.event_name;
  document.getElementById("eventDate").value = e.event_date.replace(" ", "T");
  document.getElementById("eventDescription").value = e.description || "";
  document.getElementById("eventCategory").value = e.category_id;
  document.getElementById("eventVenue").value = e.venue_id;
  document.getElementById("eventTotalTickets").value = e.total_tickets;
  document.getElementById("eventModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("eventModal").classList.add("hidden");
}

document.getElementById("eventForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("eventId").value;

  const payload = {
    event_name: document.getElementById("eventName").value,
    event_date: document.getElementById("eventDate").value,
    description: document.getElementById("eventDescription").value,
    category_id: parseInt(document.getElementById("eventCategory").value),
    venue_id: parseInt(document.getElementById("eventVenue").value),
    total_tickets: parseInt(document.getElementById("eventTotalTickets").value)
  };

  if (id) {
    await apiRequest(API_ENDPOINTS.admin.updateEvent(id), {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  } else {
    await apiRequest(API_ENDPOINTS.admin.createEvent, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  closeModal();
  initAdminDashboard();
});

async function deleteEvent(id) {
  if (!confirm("Are you sure you want to delete this event?")) return;

  await apiRequest(API_ENDPOINTS.admin.deleteEvent(id), {
    method: "DELETE"
  });

  initAdminDashboard();
}
