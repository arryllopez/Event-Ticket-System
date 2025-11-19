document.addEventListener("DOMContentLoaded", () => {
  initAdminDashboard();
  loadCategories();
  loadVenues();
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
    renderSalesChart(window.adminEvents);

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
      .map(e => {
        const date = new Date(e.event_date);
        const formattedDate = isNaN(date)
          ? e.event_date
          : date.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });

        const revenue = (e.tickets || []).reduce(
          (sum, t) => sum + Number(t.price) * Number(t.quantity_sold || 0),
          0
        );

        return `
          <tr>
            <td>${e.event_id}</td>
            <td>${e.event_name}</td>
            <td>${e.category_name || ""}</td>
            <td>${e.venue_name || ""}</td>
            <td>${e.city || ""}</td>
            <td>${formattedDate}</td>
            <td>${e.status}</td>
            <td>${e.total_tickets}</td>
            <td>${e.tickets_sold}</td>
            <td>$${(e.total_revenue || 0).toFixed(2)}</td>
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


function openCreateEvent() {
  document.getElementById("modalTitle").textContent = "Create Event";
  document.getElementById("eventId").value = "";
  document.getElementById("eventForm").reset();
  document.getElementById("ticketList").innerHTML = "";
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

  document.getElementById("ticketList").innerHTML = "";

  document.getElementById("eventModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("eventModal").classList.add("hidden");
}

document.getElementById("addTicketBtn").addEventListener("click", () => {
  const type = document.getElementById("ticketType").value;
  const price = document.getElementById("ticketPrice").value;
  const qty = document.getElementById("ticketQty").value;

  if (!type || !price || !qty) return;

  const container = document.getElementById("ticketList");
  const id = Date.now();

  container.insertAdjacentHTML(
    "beforeend",
    `
    <div class="ticket-row" data-id="${id}">
      <span>${type} - $${price} (${qty})</span>
      <button onclick="removeTicket(${id})">X</button>
    </div>
  `
  );

  if (!window.tempTickets) window.tempTickets = [];
  window.tempTickets.push({ type, price, qty, rowId: id });

  document.getElementById("ticketType").value = "";
  document.getElementById("ticketPrice").value = "";
  document.getElementById("ticketQty").value = "";
});

function removeTicket(rowId) {
  document.querySelector(`.ticket-row[data-id="${rowId}"]`)?.remove();
  window.tempTickets = window.tempTickets.filter(t => t.rowId !== rowId);
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

  let eventId = id;

  if (id) {
    await apiRequest(API_ENDPOINTS.admin.updateEvent(id), {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  } else {
    const created = await apiRequest(API_ENDPOINTS.admin.createEvent, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    eventId = created.event_id;
  }

  if (window.tempTickets && window.tempTickets.length > 0) {
    for (const t of window.tempTickets) {
      await apiRequest(`${API_BASE_URL}/tickets`, {
        method: "POST",
        body: JSON.stringify({
          event_id: eventId,
          ticket_type: t.type,
          price: parseFloat(t.price),
          quantity_available: parseInt(t.qty)
        })
      });
    }
    window.tempTickets = [];
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

async function loadCategories() {
  const categories = await apiRequest(`${API_BASE_URL}/categories/`);
  const select = document.getElementById("eventCategory");
  select.innerHTML = categories.map(c => `<option value="${c.category_id}">${c.category_name}</option>`).join("");
}

async function loadVenues() {
  const venues = await apiRequest(`${API_BASE_URL}/venues/`);
  const select = document.getElementById("eventVenue");
  select.innerHTML = venues.map(v => `<option value="${v.venue_id}">${v.venue_name}</option>`).join("");
}

//chart generation

async function renderSalesChart(events) {
    const ctx = document.getElementById("salesChart").getContext("2d");

    // remove old chart if exists (prevents error when refreshing)
    if (window.salesChartInstance) {
        window.salesChartInstance.destroy();
    }

    const labels = events.map(e => e.event_name);
    const soldData = events.map(e => e.tickets_sold);
    const totalData = events.map(e => e.total_tickets);

    window.salesChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Tickets Sold",
                    data: soldData,
                    backgroundColor: "rgba(54, 162, 235, 0.7)"
                },
                {
                    label: "Total Tickets",
                    data: totalData,
                    backgroundColor: "rgba(255, 99, 132, 0.7)"
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "top" },
                title: {
                    display: true,
                    text: "Event Ticket Sales Overview"
                }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
