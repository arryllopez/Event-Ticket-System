const API_BASE = "http://127.0.0.1:5000/api/owner";
const token = localStorage.getItem("authToken"); // Ensure this is set on login

async function fetchViewData(endpoint) {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    alert(`Failed to load ${endpoint} data: ${response.statusText}`);
    return [];
  }
  return await response.json();
}

function renderTableRows(tableId, rows, columns) {
  const tbody = document.getElementById(tableId).querySelector("tbody");
  tbody.innerHTML = rows.map(row => {
    return `<tr>${columns.map(col => `<td>${row[col] ?? ""}</td>`).join("")}</tr>`;
  }).join("");
}

async function loadView1() {
  const data = await fetchViewData("view1");
  renderTableRows("view1Table", data, ["event_id", "event_name", "category_name", "venue_name", "city", "event_date"]);
}

async function loadView2() {
  const data = await fetchViewData("venues-top-sold");
  renderTableRows("view2Table", data, ["venue_id", "venue_name", "city", "events_count", "total_tickets_sold"]);
}

// Load all views on page load
document.addEventListener("DOMContentLoaded", async () => {
  await loadView1();
  await loadView2();
  // Call other loadViewX functions for other views here
});
