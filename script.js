// script.js - Updated with minor improvements

// =============== Product Data ===============
const products = Array.isArray(window.products) ? window.products : [];

// =============== Product Display ===============
// ---------- Product display with badge & overlay ----------
// =============== Enhanced Product Display ===============
const productList = document.getElementById("productList");
productList.innerHTML = "";

products.forEach((p, i) => {
  const badge = (i % 7 === 0) ? "🔥 Best Seller" : (i % 6 === 0 ? "🆕 New" : "");
  const stock = Math.floor(Math.random() * 50) + 10; // Random stock for demo
  
  productList.innerHTML += `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 d-flex" data-aos="fade-up" data-aos-delay="${i * 100}">
      <div class="card product-card shadow-sm flex-fill">
        ${badge ? `<span class="product-badge">${badge}</span>` : ""}
        <div class="product-image-container">
          <img src="${p.img}" class="card-img-top" alt="${p.name}" loading="lazy">
        </div>
        <div class="card-body text-center d-flex flex-column">
          <h5 class="fw-semibold mb-2">${p.name}</h5>
          <div class="price-tag">₱${p.price.toLocaleString()}</div>
          <div class="stock-indicator mb-3">${stock} in stock</div>
          <button class="btn add-to-cart mt-auto" data-index="${i}">
            <i class="bi bi-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>`;
});


// Hover animation for product cards
document.addEventListener("mouseover", (e) => {
  if (e.target.closest(".product-card")) {
    e.target.closest(".product-card").style.transform = "translateY(-5px)";
    e.target.closest(".product-card").style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
  }
});
document.addEventListener("mouseout", (e) => {
  if (e.target.closest(".product-card")) {
    e.target.closest(".product-card").style.transform = "translateY(0)";
    e.target.closest(".product-card").style.boxShadow = "0 5px 15px rgba(0,0,0,0.08)";
  }
});

// =============== Cart Logic ===============
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Ensure each cart item has quantity
cart = cart.map(item => ({ quantity: item.quantity || 1, ...item }));

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const totalPrice = document.getElementById("totalPrice");
  cartItems.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-cart-x display-1 text-muted mb-3"></i>
        <p class="text-muted fs-5">Your cart is empty</p>
        <a href="#products" class="btn btn-primary mt-2">Start Shopping</a>
      </div>`;
  } else {
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      
      cartItems.innerHTML += `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-sm cart-card mb-4" data-aos="fade-up">
            <img src="${item.img}" class="card-img-top" alt="${item.name}" style="height: 200px; object-fit: cover;">
            <div class="card-body text-center">
              <h6 class="fw-semibold mb-2">${item.name}</h6>
              <div class="cart-item-total">₱${itemTotal.toLocaleString()}</div>
              <div class="text-muted mb-3">₱${item.price.toLocaleString()} each</div>

              <div class="cart-item-controls">
                <button class="quantity-btn qty-decrease" data-index="${index}">−</button>
                <div class="quantity-display">${item.quantity}</div>
                <button class="quantity-btn qty-increase" data-index="${index}">+</button>
              </div>

              <button class="btn remove-item mt-3 w-100" data-index="${index}">
                <i class="bi bi-trash3"></i> Remove
              </button>
            </div>
          </div>
        </div>`;
    });
  }
  totalPrice.textContent = `Total: ₱${total.toLocaleString()}`;
  localStorage.setItem("cart", JSON.stringify(cart));
  
  // Update cart badge
  updateCartBadge();
}

function updateCartBadge() {
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  let badge = document.querySelector('.cart-badge');
  
  if (!badge && cartCount > 0) {
    const cartLink = document.querySelector('a[href="#cartSection"]');
    if (cartLink) {
      cartLink.style.position = 'relative';
      cartLink.innerHTML += `<span class="cart-badge">${cartCount}</span>`;
    }
  } else if (badge) {
    badge.textContent = cartCount;
    if (cartCount === 0) {
      badge.remove();
    }
  }
}

// =============== Add/Remove Items ===============
document.addEventListener("click", (e) => {
  // Add to cart (if product exists, increase qty)
  if (e.target.closest(".add-to-cart")) {
    const btn = e.target.closest(".add-to-cart");
    const index = parseInt(btn.dataset.index, 10);
    const productToAdd = { ...products[index], quantity: 1 };

    // if already in cart, increment quantity
    const existing = cart.find(c => c.name === productToAdd.name);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push(productToAdd);
    }
    renderCart();
    showAddToCartToast(products[index].name);
  }

  // Quick view
  if (e.target.closest(".quick-view-btn")) {
    const idx = e.target.closest(".quick-view-btn").dataset.index;
    const p = products[idx];
    Swal.fire({
      title: p.name,
      html: `<img src="${p.img}" style="width:200px;max-width:80%;border-radius:8px"><p class="mt-3">Price: ₱${p.price.toLocaleString()}</p>`,
      confirmButtonText: 'Add to cart',
      ...swalTheme
    }).then(res => {
      if (res.isConfirmed) {
        // add one
        const existing = cart.find(c => c.name === p.name);
        if (existing) existing.quantity += 1;
        else cart.push({ ...p, quantity: 1});
        renderCart();
        showAddToCartToast(p.name);
      }
    });
  }

  // Remove item
  if (e.target.closest(".remove-item")) {
    const idx = parseInt(e.target.closest(".remove-item").dataset.index, 10);
    cart.splice(idx, 1);
    renderCart();
  }

  // Qty increase
  if (e.target.classList.contains("qty-increase")) {
    const idx = parseInt(e.target.closest(".qty-controls").dataset.index, 10);
    cart[idx].quantity += 1;
    renderCart();
  }

  // Qty decrease
  if (e.target.classList.contains("qty-decrease")) {
    const idx = parseInt(e.target.closest(".qty-controls").dataset.index, 10);
    if (cart[idx].quantity > 1) {
      cart[idx].quantity -= 1;
    } else {
      // optional: confirm removal if hits 0
      cart.splice(idx, 1);
    }
    renderCart();
  }
});


// =============== Checkout (COD + Receipt on Page) ===============
document.addEventListener("DOMContentLoaded", () => {
  const checkoutBtn = document.getElementById("checkoutBtn");
  const receiptModal = document.getElementById("receiptModal");
  const closeReceipt = document.getElementById("closeReceipt");
  const receiptDetails = document.getElementById("receiptDetails");

checkoutBtn.addEventListener("click", async () => {
  if (cart.length === 0) {
    Swal.fire({ title: 'Cart empty', text: 'Add items before checkout', icon: 'info', ...swalTheme });
    return;
  }

  // Create order before clearing cart
  const newOrder = createOrder();
  
  // Show pulse quickly
  checkoutBtn.classList.add("pulse");
  checkoutBtn.disabled = true;
  await new Promise(r => setTimeout(r, 900));

    // show pulse quickly
    checkoutBtn.classList.add("pulse");
    checkoutBtn.disabled = true;
    await new Promise(r => setTimeout(r, 900)); // small delay

    const now = new Date();
    let total = 0;
    let itemsHTML = cart.map(item => {
      total += item.price * (item.quantity || 1);
      return `<p>${item.name} x ${item.quantity || 1} - ₱${(item.price * (item.quantity || 1)).toLocaleString()}</p>`;
    }).join("");

   receiptDetails.innerHTML = `
  <div class="receipt-header">
    <h4 class="fw-bold mb-2">Vince HomeDecor</h4>
    <p class="mb-1">Thank you for your purchase!</p>
    <small class="text-muted">Order #${Math.random().toString(36).substr(2, 9).toUpperCase()}</small>
  </div>
  
  <p><strong>Date:</strong> ${now.toLocaleDateString()} ${now.toLocaleTimeString()}</p>
  <hr class="dotted-line">
  
  <div class="receipt-items">
    ${cart.map(item => `
      <div class="receipt-item">
        <span>${item.name} x${item.quantity}</span>
        <span>₱${(item.price * item.quantity).toLocaleString()}</span>
      </div>
    `).join('')}
  </div>
  
  <hr class="dotted-line">
  <div class="receipt-total">
    <span>Total:</span>
    <span>₱${total.toLocaleString()}</span>
  </div>
  
  <p class="text-center mt-3">Payment Method: <strong>Cash on Delivery</strong></p>
  <p class="text-center text-muted small">Please have exact amount ready</p>
  
  
  <p class="text-center fw-bold mt-4">THANK YOU FOR SHOPPING WITH US!</p>
`;

    receiptModal.classList.remove("d-none");
    cart = [];
  renderCart();
  renderOrders(); // Refresh orders list

  checkoutBtn.classList.remove("pulse");
  checkoutBtn.disabled = false;
});

  if (closeReceipt) {
    closeReceipt.addEventListener("click", () => {
      receiptModal.classList.add("d-none");
    });
  }
});

// =============== Login / Logout / Signup ===============
const authBtn = document.getElementById("authBtn");
const loginSection = document.getElementById("loginSection");
const mainContent = document.getElementById("mainContent");
let user = localStorage.getItem("user");

function showMain() {
  loginSection.classList.add("d-none");
  mainContent.classList.remove("d-none");
}
function hideMain() {
  loginSection.classList.remove("d-none");
  mainContent.classList.add("d-none");
}
function updateAuthUI() {
  if (user) {
    authBtn.innerHTML = `<i class="bi bi-box-arrow-right"></i> Logout`;
    showMain();
  } else {
    authBtn.innerHTML = `<i class="bi bi-person-circle"></i> Login`;
    hideMain();
  }
}
updateAuthUI();

// ===== SweetAlert Theme =====
const swalTheme = {
  confirmButtonColor: '#d4af37',
  cancelButtonColor: '#bdb76b',
  background: '#fffaf0',
  color: '#4b3832',
};

// ===== Signup & Login Handling =====
document.getElementById("loginBtn").addEventListener("click", async () => {
  const loginBtn = document.getElementById("loginBtn");
  const originalHTML = loginBtn.innerHTML;
  loginBtn.disabled = true;
  loginBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...`;

  // small delay to show loading (simulate network)
  await new Promise(r => setTimeout(r, 700));

  // existing login logic below (keep your storedUsers logic)
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
  const existingUser = storedUsers.find(u => u.email === email && u.password === pass);

  if (existingUser) {
    localStorage.setItem("user", email);
    user = email;
    Swal.fire({
      title: 'Welcome!',
      text: 'Successfully logged in to Vince HomeDecor!',
      icon: 'success',
      timer: 1200,
      showConfirmButton: false,
      ...swalTheme,
    }).then(updateAuthUI);
  } else {
    // reuse your sign-up SweetAlert flow (unchanged)
    Swal.fire({
      title: 'Account Not Found',
      text: 'No account found with that email. Would you like to sign up?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Sign Up',
      cancelButtonText: 'Cancel',
      ...swalTheme,
    }).then(result => {
      if (result.isConfirmed) {
        // your signup flow (unchanged)
        Swal.fire({
          title: 'Create Account',
          html: `
            <input id="signupEmail" class="swal2-input" placeholder="Enter email">
            <input id="signupPass" type="password" class="swal2-input" placeholder="Enter password">
          `,
          confirmButtonText: 'Sign Up',
          focusConfirm: false,
          preConfirm: () => {
            const email = document.getElementById('signupEmail').value;
            const pass = document.getElementById('signupPass').value;
            if (!email || !pass) {
              Swal.showValidationMessage('Please enter both email and password');
            }
            return { email, pass };
          },
          ...swalTheme,
        }).then(res => {
          if (res.value) {
            const users = JSON.parse(localStorage.getItem("users")) || [];
            users.push({ email: res.value.email, password: res.value.pass });
            localStorage.setItem("users", JSON.stringify(users));
            Swal.fire({
              title: 'Account Created!',
              text: 'You can now log in using your new account.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
              ...swalTheme,
            });
          }
        });
      }
    });
  }

  loginBtn.disabled = false;
  loginBtn.innerHTML = originalHTML;
});


authBtn.addEventListener("click", () => {
  if (user) {
    Swal.fire({
      title: 'Logout Confirmation',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      ...swalTheme,
    }).then(result => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          ...swalTheme,
        }).then(() => {
          localStorage.removeItem("user");
          user = null;
          updateAuthUI();
        });
      }
    });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// ===== Add to Cart Toast =====
function showAddToCartToast(itemName) {
  Swal.fire({
    position: 'center',
    icon: 'success',
    title: `${itemName} added to your cart!`,
    showConfirmButton: false,
    timer: 1500,
    background: '#fffaf0',
    color: '#4b3832',
    customClass: { popup: 'shadow-lg rounded-4 border border-warning-subtle' },
    didOpen: (popup) => {
      popup.style.padding = '1.5rem';
      popup.style.fontWeight = '600';
      popup.style.fontSize = '1.1rem';
      popup.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
    }
  });
}


// Back to top
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) backToTop.classList.add("show");
  else backToTop.classList.remove("show");
});
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Contact form with enhanced validation
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    
    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const msg = document.getElementById("contactMessage").value.trim();
    
    // Enhanced validation
    if (!name || !email || !msg) {
      Swal.fire({ 
        title: 'Please fill all fields', 
        icon: 'warning', 
        ...swalTheme 
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({ 
        title: 'Invalid Email', 
        text: 'Please enter a valid email address', 
        icon: 'warning', 
        ...swalTheme 
      });
      return;
    }
    
    // Show sending state
    const submitBtn = contactForm.querySelector('.btn-send');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
      contactForm.reset();
      
      // Reset floating labels
      const formControls = contactForm.querySelectorAll('.form-control');
      formControls.forEach(control => {
        control.blur();
      });
      
      Swal.fire({ 
        title: 'Message Sent!', 
        text: 'Thank you for your message. We will get back to you soon.', 
        icon: 'success', 
        ...swalTheme 
      });
      
      // Reset button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }, 1500);
  });
}

// hero scroll cue: smooth scroll to products
document.querySelectorAll('.hero-scroll-cue').forEach(cue => {
  cue.addEventListener('click', () => {
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
});

// =============== Orders Logic ===============
let orders = JSON.parse(localStorage.getItem("orders")) || [];

// Function to create an order from cart
function createOrder() {
  if (cart.length === 0) return null;
  
  const order = {
    id: 'VHD' + Date.now().toString().slice(-6),
    date: new Date().toISOString(),
    items: [...cart],
    status: 'pending', // pending, confirmed, shipped, delivered, cancelled
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  };
  
  orders.unshift(order); // Add to beginning of array
  localStorage.setItem("orders", JSON.stringify(orders));
  return order;
}

// Function to render orders
// Function to render orders
function renderOrders() {
  const ordersList = document.getElementById("ordersList");
  const clearAllBtn = document.getElementById("clearAllOrders");
  
  // Show/hide clear all button based on orders
  if (orders.length > 0) {
    clearAllBtn.style.display = 'block';
  } else {
    clearAllBtn.style.display = 'none';
  }
  
  if (orders.length === 0) {
    ordersList.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-receipt display-1 text-muted mb-3"></i>
        <p class="text-muted fs-5">You haven't placed any orders yet</p>
        <a href="#products" class="btn btn-primary mt-2">Start Shopping</a>
      </div>`;
    return;
  }
  
  ordersList.innerHTML = orders.map(order => `
    <div class="col-12">
      <div class="order-card" data-aos="fade-up">
        <div class="order-header">
          <div>
            <h5 class="order-id mb-1">Order #${order.id}</h5>
            <p class="order-date mb-0">${new Date(order.date).toLocaleDateString()} • ${new Date(order.date).toLocaleTimeString()}</p>
          </div>
          <div class="order-header-actions">
            <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
            <button class="btn btn-delete-order" onclick="confirmDeleteOrder('${order.id}')" title="Delete Order">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="order-body">
          <div class="order-items">
            ${order.items.map(item => `
              <div class="order-item">
                <img src="${item.img}" alt="${item.name}" class="order-item-img">
                <div class="order-item-details">
                  <h6 class="order-item-name">${item.name}</h6>
                  <p class="order-item-price mb-0">₱${item.price.toLocaleString()} × ${item.quantity}</p>
                </div>
                <div class="order-item-total">
                  ₱${(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="order-total">
            <span>Total Amount:</span>
            <span>₱${order.total.toLocaleString()}</span>
          </div>
          
          <div class="order-actions">
            <button class="btn btn-track" onclick="trackOrder('${order.id}')">
              <i class="bi bi-truck"></i> Track Order
            </button>
            <button class="btn btn-reorder" onclick="reorder('${order.id}')">
              <i class="bi bi-arrow-repeat"></i> Reorder
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Helper function to get status text
function getStatusText(status) {
  const statusMap = {
    'pending': 'Pending Confirmation',
    'confirmed': 'Order Confirmed',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return statusMap[status] || status;
}

// Function to track order
function trackOrder(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const statusSteps = [
    { status: 'pending', label: 'Order Placed', description: 'We have received your order' },
    { status: 'confirmed', label: 'Confirmed', description: 'Order has been confirmed' },
    { status: 'shipped', label: 'Shipped', description: 'Your order is on the way' },
    { status: 'delivered', label: 'Delivered', description: 'Order has been delivered' }
  ];
  
  const currentStatusIndex = statusSteps.findIndex(step => step.status === order.status);
  
  let trackingHTML = `
    <div class="tracking-timeline">
      ${statusSteps.map((step, index) => `
        <div class="tracking-step ${index <= currentStatusIndex ? 'active' : ''}">
          <div class="tracking-dot"></div>
          <div class="tracking-content">
            <strong>${step.label}</strong>
            <p class="mb-0">${step.description}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  Swal.fire({
    title: `Tracking Order #${orderId}`,
    html: trackingHTML,
    confirmButtonText: 'Close',
    ...swalTheme
  });
}

// Function to reorder
function reorder(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  // Add all items from the order to cart
  order.items.forEach(orderItem => {
    const existingItem = cart.find(cartItem => cartItem.name === orderItem.name);
    if (existingItem) {
      existingItem.quantity += orderItem.quantity;
    } else {
      cart.push({ ...orderItem });
    }
  });
  
  renderCart();
  
  Swal.fire({
    title: 'Items Added to Cart!',
    text: 'All items from this order have been added to your cart.',
    icon: 'success',
    timer: 1500,
    showConfirmButton: false,
    ...swalTheme
  });
}

// Add tracking timeline styles dynamically
const trackingStyles = `
.tracking-timeline {
  position: relative;
  padding-left: 2rem;
  margin: 1rem 0;
}

.tracking-step {
  position: relative;
  padding-bottom: 2rem;
}

.tracking-step:last-child {
  padding-bottom: 0;
}

.tracking-dot {
  position: absolute;
  left: -2rem;
  top: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #dee2e6;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #dee2e6;
}

.tracking-step.active .tracking-dot {
  background: #d4af37;
  box-shadow: 0 0 0 2px #d4af37;
}

.tracking-step::before {
  content: '';
  position: absolute;
  left: -1.8rem;
  top: 20px;
  bottom: 0;
  width: 2px;
  background: #dee2e6;
}

.tracking-step:last-child::before {
  display: none;
}

.tracking-step.active::before {
  background: #d4af37;
}

.tracking-content {
  margin-left: 0;
}
`;

// Inject tracking styles
const styleSheet = document.createElement('style');
styleSheet.textContent = trackingStyles;
document.head.appendChild(styleSheet);

// Function to confirm order deletion
function confirmDeleteOrder(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  Swal.fire({
    title: 'Delete Order?',
    html: `
      <div class="delete-confirmation">
        <i class="bi bi-exclamation-triangle display-4 text-warning mb-3"></i>
        <p>Are you sure you want to delete <strong>Order #${orderId}</strong>?</p>
        <p class="small text-muted">This action cannot be undone.</p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#e74c3c',
    cancelButtonColor: '#6c757d',
    background: '#fffaf0',
    customClass: {
      popup: 'rounded-4 border border-warning-subtle'
    },
    ...swalTheme
  }).then((result) => {
    if (result.isConfirmed) {
      deleteOrder(orderId);
    }
  });
}

// Function to delete order
function deleteOrder(orderId) {
  // Find order index
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) return;
  
  // Remove order from array
  const deletedOrder = orders.splice(orderIndex, 1)[0];
  
  // Update localStorage
  localStorage.setItem("orders", JSON.stringify(orders));
  
  // Re-render orders
  renderOrders();
  
  // Show success message
  Swal.fire({
    title: 'Order Deleted!',
    text: `Order #${orderId} has been removed from your order history.`,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
    background: '#fffaf0',
    customClass: {
      popup: 'rounded-4 border border-success-subtle'
    },
    ...swalTheme
  });
}

// Function to delete all orders (optional - for power users)
function confirmDeleteAllOrders() {
  if (orders.length === 0) {
    Swal.fire({
      title: 'No Orders',
      text: 'There are no orders to delete.',
      icon: 'info',
      ...swalTheme
    });
    return;
  }

  Swal.fire({
    title: 'Delete All Orders?',
    html: `
      <div class="delete-confirmation">
        <i class="bi bi-exclamation-triangle display-4 text-danger mb-3"></i>
        <p>Are you sure you want to delete <strong>all ${orders.length} orders</strong>?</p>
        <p class="small text-muted">This action cannot be undone and will permanently remove your entire order history.</p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete All',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#e74c3c',
    cancelButtonColor: '#6c757d',
    background: '#fffaf0',
    customClass: {
      popup: 'rounded-4 border border-danger-subtle'
    },
    ...swalTheme
  }).then((result) => {
    if (result.isConfirmed) {
      deleteAllOrders();
    }
  });
}

// Function to delete all orders
function deleteAllOrders() {
  const orderCount = orders.length;
  
  // Clear all orders
  orders = [];
  localStorage.setItem("orders", JSON.stringify(orders));
  
  // Re-render orders
  renderOrders();
  
  // Show success message
  Swal.fire({
    title: 'All Orders Deleted!',
    text: `All ${orderCount} orders have been removed from your order history.`,
    icon: 'success',
    timer: 2500,
    showConfirmButton: false,
    background: '#fffaf0',
    customClass: {
      popup: 'rounded-4 border border-success-subtle'
    },
    ...swalTheme
  });
}

// Add event listener for clear all orders button
document.addEventListener('DOMContentLoaded', function() {
  const clearAllBtn = document.getElementById("clearAllOrders");
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", confirmDeleteAllOrders);
  }
  
  renderOrders();
});