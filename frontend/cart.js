// Load cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById("cartCount");
    if (cartCount) cartCount.textContent = count;
}

// Render cart items
function renderCart() {
    const cart = getCart();
    const container = document.getElementById("cartContainer");
    const totalSpan = document.getElementById("cartTotal");

    if (cart.length === 0) {
        container.innerHTML = `
            <p style="color:var(--text-secondary); font-size:18px; text-align:center; margin-top:40px;">
                Your cart is empty.
            </p>`;
        totalSpan.textContent = "0.00";
        return;
    }

    let html = "";
    let total = 0;

    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        html += `
            <div class="ticket-option" style="display:flex; justify-content:space-between; margin-bottom:16px;">
                <div>
                    <h3>${item.ticket_type || "Ticket"}</h3>
                    <p><strong>${item.event_name}</strong></p>
                    <p>Event ID: ${item.event_id}</p>
                    <p>Price: $${item.price.toFixed(2)}</p>
                    <p>Quantity: ${item.quantity}</p>
                </div>

                <div style="text-align:right;">
                    <p><strong>$${subtotal.toFixed(2)}</strong></p>
                    <button class="btn-secondary" onclick="removeFromCart(${index})">Remove</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    totalSpan.textContent = total.toFixed(2);
}

function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
    updateCartCount();
}

// Checkout function
async function checkout() {
    const cart = getCart();

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("You must be logged in to checkout.");
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ items: cart })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.msg || "Checkout failed");
        }

        alert("Purchase successful! Tickets added to your dashboard.");

        localStorage.removeItem("cart");
        updateCartCount();
        window.location.href = "customer-dashboard.html";

    } catch (err) {
        alert("Checkout failed: " + err.message);
    }
}

// Init
document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    updateCartCount();

    const btn = document.getElementById("checkoutBtn");
    if (btn) btn.onclick = checkout;
});
