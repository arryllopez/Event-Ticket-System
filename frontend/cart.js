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
    const totalSpan =
    document.getElementById("checkoutTotal") ||
    document.getElementById("cartTotal");


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
                    <p>Price: $${Number(item.price).toFixed(2)}</p>
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

async function checkout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // Collect CUSTOMER form fields
    const customerData = {
        first_name: document.getElementById("firstName").value.trim(),
        last_name: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
    };

    const payment_method = document.getElementById("paymentMethod").value;

    // Calculate total
    const total_amount = cart.reduce((sum, item) => {
        return sum + item.price * item.quantity;
    }, 0);

    const payload = {
        customer: customerData,
        payment_method,
        total_amount,
        items: cart.map(item => ({
    ticket_id: item.ticket_id,
    quantity: item.quantity,
    price: Number(item.price),
    subtotal: Number(item.price) * Number(item.quantity)
}))

    };

    try {
        const res = await fetch(`${API_BASE_URL}/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.msg || "Checkout failed");
        }

        alert("Purchase successful!");

        localStorage.removeItem("cart");
        window.location.href = "customer-dashboard.html";

    } catch (err) {
        alert("Checkout Error: " + err.message);
    }
}


// Init
document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    updateCartCount();

    const btn = document.getElementById("checkoutBtn");
    if (btn) btn.onclick = checkout;
});
