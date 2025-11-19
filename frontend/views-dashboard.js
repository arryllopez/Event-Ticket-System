const API_BASE = "http://127.0.0.1:5000/api/views";

async function fetchViewData(endpoint) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`);
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    alert(`Failed loading ${endpoint}: ${err.message}`);
    return [];
  }
}

function renderTable(tableId, data, columns) {
  const tbody = document.getElementById(tableId).querySelector("tbody");
  tbody.innerHTML = data.map(row =>
    `<tr>${columns.map(col => `<td>${row[col] ?? ""}</td>`).join("")}</tr>`
  ).join("");
}

// Load each view data and render in respective table by IDs and columns
async function loadViews() {
  await Promise.all([
    (async () => {
      const cols = ["event_id", "event_name", "category_name", "venue_name", "city", "event_date", "total_tickets", "tickets_sold", "total_revenue"];
      const data = await fetchViewData("view1");
      renderTable("view1Table", data, cols);
    })(),
    (async () => {
      const cols = ["venue_id", "venue_name", "city", "total_events", "total_tickets_sold"];
      const data = await fetchViewData("view2");
      renderTable("view2Table", data, cols);
    })(),
    (async () => {
      const cols = ["customer_id", "customer_name", "purchase_id", "purchase_date", "purchase_total", "avg_customer_spending"];
      const data = await fetchViewData("view3");
      renderTable("view3Table", data, cols);
    })(),
    (async () => {
      const cols = ["customer_id", "first_name", "last_name", "purchase_id", "purchase_date", "total_amount"];
      const data = await fetchViewData("view4");
      renderTable("view4Table", data, cols);
    })(),
    (async () => {
      const cols = ["customer_id", "customer_name", "email", "event_id", "event_name", "category_name"];
      const data = await fetchViewData("view5");
      renderTable("view5Table", data, cols);
    })(),
    (async () => {
      const cols = ["category_id", "category_name", "total_events", "total_tickets_sold", "total_revenue"];
      const data = await fetchViewData("view6");
      renderTable("view6Table", data, cols);
    })(),
    (async () => {
      const cols = ["event_id", "event_name", "category_name", "venue_name", "event_date", "total_tickets", "tickets_sold", "tickets_remaining"];
      const data = await fetchViewData("view7");
      renderTable("view7Table", data, cols);
    })(),
    (async () => {
      const cols = ["event_id", "event_name", "category_name", "venue_name", "event_date", "total_tickets", "tickets_sold", "tickets_remaining"];
      const data = await fetchViewData("view8");
      renderTable("view8Table", data, cols);
    })(),
    (async () => {
      const cols = ["customer_id", "customer_name", "email", "category_name", "tickets_purchased", "total_spent"];
      const data = await fetchViewData("view9");
      renderTable("view9Table", data, cols);
    })(),
    (async () => {
      const cols = ["category_name", "customer_id", "customer_name", "email", "total_spent", "tickets_purchased"];
      const data = await fetchViewData("view10");
      renderTable("view10Table", data, cols);
    })(),
  ]);
}

document.addEventListener("DOMContentLoaded", loadViews);
