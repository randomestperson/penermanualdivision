// assets/js/cart.js
// Enhanced cart.js - supports variants & quantities, used by select.html and cart.html

// addToCart accepts productName (string), price (number), variant (string, optional), qty optional
function addToCart(productName, price, variant = "", qty = 1) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // We'll store name including variant so cart items are distinct
  const keyName = productName; // expected already to include variant in select.html usage
  const existing = cart.find(item => item.name === keyName && item.price === price);

  if (existing) {
    existing.quantity = (existing.quantity || 0) + qty;
  } else {
    cart.push({ name: keyName, price: Number(price), quantity: qty });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// Updates the cart count button with total quantity
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const cartButton = document.getElementById("cart-button");
  if (cartButton) {
    cartButton.textContent = count > 0 ? `View Your Cart (${count})` : "View Your Cart";
  }
}

// Loads cart into cart.html table
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const tbody = document.querySelector("#cart-table tbody");
  const totalEl = document.getElementById("cart-total");

  if (!tbody || !totalEl) return;

  tbody.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    // quantity controls
    const row = `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>$${Number(item.price).toFixed(2)}</td>
        <td>
          <a href="#" onclick="changeQuantity(${index}, -1)">−</a>
          &nbsp;${item.quantity}&nbsp;
          <a href="#" onclick="changeQuantity(${index}, 1)">+</a>
        </td>
        <td>$${itemTotal.toFixed(2)}</td>
        <td><a href="#" onclick="removeFromCart(${index})">Remove</a></td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", row);
  });

  totalEl.textContent = "Total: $" + total.toFixed(2);
}

// change item quantity by delta
function changeQuantity(index, delta) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!cart[index]) return;
  cart[index].quantity = Math.max(0, (cart[index].quantity || 0) + delta);
  if (cart[index].quantity === 0) {
    cart.splice(index, 1);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartCount();
}

function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartCount();
}

function checkout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    // nothing to checkout
    showTempConfirm("Your cart is empty.");
    return;
  }
  // For demo: clear cart and show confirmation
  localStorage.removeItem("cart");
  loadCart();
  updateCartCount();
  showTempConfirm("Thank you — your order has been placed (demo).");
}

// helper: small on-page confirmation (used by select.html for friendly UX)
function showTempConfirm(msg) {
  // If the select page has #confirm, use that. Otherwise do a small floating message
  const confirmEl = document.getElementById('confirm');
  if (confirmEl) {
    confirmEl.innerText = msg;
    confirmEl.style.display = 'block';
    setTimeout(()=> { confirmEl.style.display = 'none'; }, 3000);
    return;
  }

  // fallback toast
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = '#2b8a3e';
  toast.style.color = '#fff';
  toast.style.padding = '10px 16px';
  toast.style.borderRadius = '6px';
  toast.style.zIndex = 9999;
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(()=> toast.remove(), 2800);
}

// basic HTML escape for safe injection into table
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// init on DOM ready
document.addEventListener("DOMContentLoaded", function() {
  updateCartCount();
  // If on cart.html, load the items
  if (document.querySelector('#cart-table')) {
    loadCart();
  }
});