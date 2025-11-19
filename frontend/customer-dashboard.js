document.addEventListener("DOMContentLoaded", () => {
  initCustomerDashboard();
  const downloadBtn = document.getElementById("downloadCSV");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", handleDownloadCSV);
  }
});

async function initCustomerDashboard() {
  const statusEl = document.getElementById("ticketsStatus");
  const tableEl = document.getElementById("ticketsTable");
  const tbodyEl = document.getElementById("ticketsTableBody");
  const emptyEl = document.getElementById("ticketsEmpty");

  try {
    const user = await fetchCurrentUser();
    if (!user || !user.email) {
      statusEl.textContent = "Please sign in to view your tickets.";
      tableEl.style.display = "none";
      emptyEl.style.display = "block";
      return;
    }

    const purchases = await apiRequest(`${API_BASE_URL}/customer/purchases`);

    if (!purchases || purchases.length === 0) {
      statusEl.textContent = "You have not purchased any tickets yet.";
      tableEl.style.display = "none";
      emptyEl.style.display = "block";
      return;
    }

    statusEl.textContent = `You have ${purchases.length} ticket item${purchases.length !== 1 ? "s" : ""}.`;
    tableEl.style.display = "table";
    emptyEl.style.display = "none";

    tbodyEl.innerHTML = purchases
      .map(p => {
        const eventDateObj = new Date(p.event_date);
        const purchaseDateObj = new Date(p.purchase_date);

        const eventDate = isNaN(eventDateObj)
          ? p.event_date
          : eventDateObj.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });

        const purchaseDate = isNaN(purchaseDateObj)
          ? p.purchase_date
          : purchaseDateObj.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });

        const price = Number(p.ticket_price || 0);
        const subtotal = Number(p.subtotal || 0);

        return `
          <tr>
            <td>${p.event_name}</td>
            <td>${eventDate}</td>
            <td>${p.ticket_type}</td>
            <td>$${price.toFixed(2)}</td>
            <td>${p.quantity}</td>
            <td>$${subtotal.toFixed(2)}</td>
            <td>${purchaseDate}</td>
            <td>${p.payment_status}</td>
          </tr>
        `;
      })
      .join("");
  } catch (err) {
    const statusEl = document.getElementById("ticketsStatus");
    const tableEl = document.getElementById("ticketsTable");
    const emptyEl = document.getElementById("ticketsEmpty");
    statusEl.textContent = "Failed to load your tickets.";
    tableEl.style.display = "none";
    emptyEl.style.display = "block";
  }
}


async function loadPurchases() {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const res = await fetch(`${API_BASE_URL}/my-purchases`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const purchases = await res.json();
    console.log(purchases);

    renderPurchases(purchases);
}

function renderPurchases(purchases) {
    const container = document.getElementById("purchaseHistory");

    if (purchases.length === 0) {
        container.innerHTML = "<p>No purchases yet.</p>";
        return;
    }

    container.innerHTML = purchases.map(p => `
        <div class="purchase-card">
            <h3>Purchase #${p.purchase_id}</h3>
            <p><strong>Date:</strong> ${new Date(p.purchase_date).toLocaleString()}</p>
            <p><strong>Total:</strong> $${p.total_amount.toFixed(2)}</p>
            <p><strong>Payment:</strong> ${p.payment_method}</p>

            <h4>Tickets:</h4>
            <ul>
                ${p.tickets.map(t => `
                    <li>${t.ticket_type} — $${t.subtotal.toFixed(2)}</li>
                `).join("")}
            </ul>
        </div>
    `).join("");
}

document.addEventListener("DOMContentLoaded", loadPurchases);



function handleDownloadCSV() {
  window.location.href = `${API_BASE_URL}/customer/purchases/export`;
}
