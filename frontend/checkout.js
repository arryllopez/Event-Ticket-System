// Load cart
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Load total
function calculateCheckoutTotal() {
    const cart = getCart();
    let total = 0;

    cart.forEach(item => {
        total += Number(item.ticket_price) * Number(item.quantity);
    });

    const totalSpan = document.getElementById("checkoutTotal");
    if (totalSpan) totalSpan.textContent = total.toFixed(2);

    return total;
}

// Auto-fill user info from JWT
async function loadCustomerInfo() {
    try {
        const user = await fetchCurrentUser();
        if (!user) return;

        document.getElementById("firstName").value = user.first_name;
        document.getElementById("lastName").value = user.last_name;
        document.getElementById("email").value = user.email;
        document.getElementById("phone").value = user.phone || "";
    } catch (err) {
        console.log("Could not load user info");
    }
}

// Handle checkout button
async function completePurchase() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("You must be logged in.");
        return;
    }

    const paymentMethod = document.getElementById("paymentMethod").value;

    const payload = {
        items: cart.map(c => ({
            ticket_id: c.ticket_id,
            quantity: c.quantity,
            price: Number(c.ticket_price)
        })),
        payment_method: paymentMethod
    };

    try {
        const res = await fetch(`${API_BASE_URL}/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
            alert(`Error: ${data.msg}`);
            return;
        }

        alert("Purchase successful!");

        localStorage.removeItem("cart");
        window.location.href = "customer-dashboard.html";

    } catch (err) {
        alert("Checkout failed: " + err.message);
    }
}

// Init
document.addEventListener("DOMContentLoaded", () => {
    loadCustomerInfo();
    calculateCheckoutTotal();

    const checkoutBtn = document.getElementById("checkoutBtn");
    checkoutBtn.addEventListener("click", completePurchase);
});
