// ============================================================
// dashboard.js - Dashboard Logic for Farmers & Customers
// ============================================================

let currentUser = null;
let dashboardProducts = [];
let dashboardOrders = [];

// ============================================================
// INIT
// ============================================================
async function initDashboard() {
    currentUser = await checkAuth();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Set sidebar info
    document.getElementById('sidebarName').textContent = currentUser.name;
    const roleBadge = document.getElementById('sidebarRole');
    roleBadge.textContent = currentUser.role;
    roleBadge.className = `role-badge role-${currentUser.role.toLowerCase()}`;
    document.getElementById('dashWelcome').textContent =
        `Welcome back, ${currentUser.name}! 👋`;

    // Show/hide role-specific nav
    if (currentUser.role === 'Farmer') {
        document.getElementById('farmerLinks').classList.remove('hidden');
        document.getElementById('customerLinks').classList.add('hidden');
        document.getElementById('ordersTitle').innerHTML =
            '<i class="fas fa-clipboard-list"></i> Customer Orders';
    } else {
        document.getElementById('farmerLinks').classList.add('hidden');
        document.getElementById('customerLinks').classList.remove('hidden');
        document.getElementById('ordersTitle').innerHTML =
            '<i class="fas fa-history"></i> My Order History';
    }

    // Check URL hash
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        const link = document.querySelector(`[data-tab="${hash}"]`);
        if (link) showTab(hash, link);
    } else {
        loadOverview();
    }
}

// ============================================================
// TAB SWITCHING
// ============================================================
function showTab(tabId, clickedLink) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

    const tab = document.getElementById(`tab-${tabId}`);
    if (tab) tab.classList.add('active');
    if (clickedLink) clickedLink.classList.add('active');

    window.location.hash = tabId;

    if (tabId === 'overview')     loadOverview();
    if (tabId === 'my-products')  loadMyProducts();
    if (tabId === 'orders')       loadOrders();
    if (tabId === 'profile')      loadProfile();
}

// ============================================================
// OVERVIEW
// ============================================================
async function loadOverview() {
    if (!currentUser) return;
    const statsGrid    = document.getElementById('statsGrid');
    const recentSection = document.getElementById('recentSection');

    try {
        if (currentUser.role === 'Farmer') {
            const [pRes, oRes] = await Promise.all([
                fetch('/api/products/farmer'),
                fetch('/api/orders/my')
            ]);
            const pData = await pRes.json();
            const oData = await oRes.json();
            dashboardProducts = pData.products || [];
            dashboardOrders   = oData.orders || [];

            const totalRevenue = dashboardOrders
                .filter(o => o.status !== 'Cancelled')
                .reduce((s, o) => s + parseFloat(o.total_amount), 0);

            const pendingOrders = dashboardOrders.filter(o => o.status === 'Pending').length;

            statsGrid.innerHTML = `
                <div class="stat-card green">
                    <div class="stat-icon"><i class="fas fa-box-open"></i></div>
                    <div class="stat-info">
                        <h3>${dashboardProducts.length}</h3>
                        <p>Total Products</p>
                    </div>
                </div>
                <div class="stat-card blue">
                    <div class="stat-icon"><i class="fas fa-clipboard-list"></i></div>
                    <div class="stat-info">
                        <h3>${dashboardOrders.length}</h3>
                        <p>Total Orders</p>
                    </div>
                </div>
                <div class="stat-card orange">
                    <div class="stat-icon"><i class="fas fa-clock"></i></div>
                    <div class="stat-info">
                        <h3>${pendingOrders}</h3>
                        <p>Pending Orders</p>
                    </div>
                </div>
                <div class="stat-card purple">
                    <div class="stat-icon"><i class="fas fa-rupee-sign"></i></div>
                    <div class="stat-info">
                        <h3>₹${totalRevenue.toFixed(0)}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>`;

            // Recent orders
            if (dashboardOrders.length > 0) {
                recentSection.innerHTML = `
                    <div class="recent-card">
                        <div class="recent-header">
                            <h3><i class="fas fa-history"></i> Recent Orders</h3>
                            <a href="#" onclick="showTab('orders', document.querySelector('[data-tab=orders]'))" class="btn btn-sm btn-outline">View All</a>
                        </div>
                        ${dashboardOrders.slice(0, 5).map(o => `
                            <div class="recent-order-item">
                                <div>
                                    <strong>Order #${o.order_id}</strong>
                                    <small>${o.customer_name}</small>
                                </div>
                                <div>
                                    <span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span>
                                    <strong>₹${parseFloat(o.total_amount).toFixed(2)}</strong>
                                </div>
                            </div>`).join('')}
                    </div>`;
            } else {
                recentSection.innerHTML = '<p class="no-data">No orders yet. Keep adding products!</p>';
            }

        } else {
            // Customer overview
            const oRes  = await fetch('/api/orders/my');
            const oData = await oRes.json();
            dashboardOrders = oData.orders || [];

            const totalSpent = dashboardOrders
                .filter(o => o.status !== 'Cancelled')
                .reduce((s, o) => s + parseFloat(o.total_amount), 0);

            const cart = getCart();

            statsGrid.innerHTML = `
                <div class="stat-card green">
                    <div class="stat-icon"><i class="fas fa-shopping-bag"></i></div>
                    <div class="stat-info">
                        <h3>${dashboardOrders.length}</h3>
                        <p>Total Orders</p>
                    </div>
                </div>
                <div class="stat-card blue">
                    <div class="stat-icon"><i class="fas fa-shopping-cart"></i></div>
                    <div class="stat-info">
                        <h3>${cart.length}</h3>
                        <p>Cart Items</p>
                    </div>
                </div>
                <div class="stat-card orange">
                    <div class="stat-icon"><i class="fas fa-truck"></i></div>
                    <div class="stat-info">
                        <h3>${dashboardOrders.filter(o => o.status === 'Shipped').length}</h3>
                        <p>In Transit</p>
                    </div>
                </div>
                <div class="stat-card purple">
                    <div class="stat-icon"><i class="fas fa-rupee-sign"></i></div>
                    <div class="stat-info">
                        <h3>₹${totalSpent.toFixed(0)}</h3>
                        <p>Total Spent</p>
                    </div>
                </div>`;

            if (dashboardOrders.length > 0) {
                recentSection.innerHTML = `
                    <div class="recent-card">
                        <div class="recent-header">
                            <h3><i class="fas fa-history"></i> Recent Orders</h3>
                            <a href="#" onclick="showTab('orders', document.querySelector('[data-tab=orders]'))" class="btn btn-sm btn-outline">View All</a>
                        </div>
                        ${dashboardOrders.slice(0, 5).map(o => `
                            <div class="recent-order-item">
                                <div>
                                    <strong>Order #${o.order_id}</strong>
                                    <small>${formatDate(o.order_date)}</small>
                                </div>
                                <div>
                                    <span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span>
                                    <strong>₹${parseFloat(o.total_amount).toFixed(2)}</strong>
                                </div>
                            </div>`).join('')}
                    </div>`;
            }
        }
    } catch (err) {
        statsGrid.innerHTML = '<p class="no-data">Could not load dashboard data.</p>';
    }
}

// ============================================================
// MY PRODUCTS (Farmer)
// ============================================================
async function loadMyProducts() {
    if (currentUser.role !== 'Farmer') return;
    const container = document.getElementById('myProductsList');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

    try {
        const res  = await fetch('/api/products/farmer');
        const data = await res.json();
        dashboardProducts = data.products || [];

        if (dashboardProducts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>No Products Yet</h3>
                    <p>Start selling by adding your first product.</p>
                    <a href="add-product.html" class="btn btn-primary"><i class="fas fa-plus"></i> Add Product</a>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div class="farmer-products-table">
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dashboardProducts.map(p => `
                            <tr>
                                <td>
                                    <div class="table-product">
                                        <div class="table-product-img">
                                            <img src="${typeof getProductImage === 'function' ? getProductImage(p) : (p.image_url || '')}" alt="${p.product_name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';" />
                                        </div>
                                        <div>
                                            <strong>${p.product_name}</strong>
                                            <small>${(p.description || '').substring(0, 40)}...</small>
                                        </div>
                                    </div>
                                </td>
                                <td><span class="category-pill">${p.category}</span></td>
                                <td><strong>₹${parseFloat(p.price).toFixed(2)}</strong></td>
                                <td>
                                    <span class="${p.quantity === 0 ? 'text-danger' : p.quantity < 10 ? 'text-warning' : 'text-success'}">
                                        ${p.quantity} units
                                    </span>
                                </td>
                                <td>
                                    <span class="status-badge ${p.quantity > 0 ? 'status-confirmed' : 'status-cancelled'}">
                                        ${p.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </td>
                                <td class="action-btns">
                                    <button onclick="openEditModal(${p.product_id})" class="btn btn-sm btn-outline">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button onclick="deleteProduct(${p.product_id}, '${p.product_name}')" class="btn btn-sm btn-danger">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch (err) {
        container.innerHTML = '<p class="no-data">Could not load products.</p>';
    }
}

// ============================================================
// ORDERS
// ============================================================
async function loadOrders() {
    const container = document.getElementById('ordersList');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

    try {
        const res  = await fetch('/api/orders/my');
        const data = await res.json();
        dashboardOrders = data.orders || [];

        if (dashboardOrders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No Orders Yet</h3>
                    <p>${currentUser.role === 'Farmer' ? 'No customer orders received yet.' : 'You haven\'t placed any orders yet.'}</p>
                    ${currentUser.role === 'Customer' ? '<a href="products.html" class="btn btn-primary"><i class="fas fa-store"></i> Shop Now</a>' : ''}
                </div>`;
            return;
        }

        container.innerHTML = `
            <div class="orders-list">
                ${dashboardOrders.map(o => `
                    <div class="order-card">
                        <div class="order-card-header">
                            <div>
                                <strong>Order #${o.order_id}</strong>
                                <span class="order-date">${formatDate(o.order_date)}</span>
                            </div>
                            <div class="order-card-right">
                                <span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span>
                                <strong class="order-total">₹${parseFloat(o.total_amount).toFixed(2)}</strong>
                            </div>
                        </div>
                        <div class="order-card-body">
                            ${currentUser.role === 'Farmer' ? `<p><i class="fas fa-user"></i> Customer: <strong>${o.customer_name}</strong></p>` : ''}
                            <p><i class="fas fa-box"></i> ${o.item_count} item(s)</p>
                            <p><i class="fas fa-map-marker-alt"></i> ${o.delivery_address}</p>
                        </div>
                        <div class="order-card-footer">
                            <button onclick="viewOrderDetails(${o.order_id})" class="btn btn-sm btn-outline">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            ${currentUser.role === 'Farmer' ? `
                                <select onchange="updateOrderStatus(${o.order_id}, this.value)" class="form-control status-select">
                                    ${['Pending','Confirmed','Shipped','Delivered','Cancelled'].map(s =>
                                        `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`
                                    ).join('')}
                                </select>` : ''
                            }
                        </div>
                    </div>`).join('')}
            </div>`;
    } catch (err) {
        container.innerHTML = '<p class="no-data">Could not load orders.</p>';
    }
}

async function viewOrderDetails(orderId) {
    try {
        const res  = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (!data.success) return;

        const o = data.order;
        const items = data.items;
        const html = `
            <div class="order-detail-modal">
                <h3>Order #${o.order_id}</h3>
                <div class="order-info-grid">
                    <div><strong>Customer:</strong> ${o.customer_name}</div>
                    <div><strong>Date:</strong> ${formatDate(o.order_date)}</div>
                    <div><strong>Status:</strong> <span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span></div>
                    <div><strong>Total:</strong> ₹${parseFloat(o.total_amount).toFixed(2)}</div>
                    <div class="full-width"><strong>Address:</strong> ${o.delivery_address}</div>
                </div>
                <h4>Items</h4>
                <table class="items-table">
                    <thead><tr><th>Product</th><th>Category</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
                    <tbody>
                        ${items.map(i => `
                            <tr>
                                <td>${i.product_name}</td>
                                <td>${i.category}</td>
                                <td>${i.quantity}</td>
                                <td>₹${parseFloat(i.price).toFixed(2)}</td>
                                <td>₹${(i.quantity * i.price).toFixed(2)}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;

        // Show in edit modal reused
        document.getElementById('editForm').innerHTML = html;
        document.querySelector('#editModal h3').textContent = 'Order Details';
        document.getElementById('editModal').classList.add('active');
    } catch (err) {
        showToast('Could not load order details.', 'error');
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const res  = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`Order status updated to "${status}"`, 'success');
        } else {
            showToast(data.message, 'error');
        }
    } catch (err) {
        showToast('Error updating status.', 'error');
    }
}

// ============================================================
// EDIT PRODUCT
// ============================================================
function openEditModal(productId) {
    const p = dashboardProducts.find(x => x.product_id === productId);
    if (!p) return;

    document.getElementById('editProductId').value = productId;
    document.getElementById('editName').value        = p.product_name;
    document.getElementById('editCategory').value    = p.category;
    document.getElementById('editPrice').value       = p.price;
    document.getElementById('editQuantity').value    = p.quantity;
    document.getElementById('editDescription').value = p.description || '';

    document.querySelector('#editModal h3').innerHTML = '<i class="fas fa-edit"></i> Edit Product';
    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editProductId').value;
    if (!id) return;

    const formData = new FormData();
    formData.append('product_name', document.getElementById('editName').value.trim());
    formData.append('category',     document.getElementById('editCategory').value);
    formData.append('price',        document.getElementById('editPrice').value);
    formData.append('quantity',     document.getElementById('editQuantity').value);
    formData.append('description',  document.getElementById('editDescription').value.trim());

    const imgFile = document.getElementById('editImage').files[0];
    if (imgFile) formData.append('image', imgFile);

    try {
        const res  = await fetch(`/api/products/${id}`, { method: 'PUT', body: formData });
        const data = await res.json();
        if (data.success) {
            showToast(data.message, 'success');
            closeEditModal();
            loadMyProducts();
        } else {
            showMessage('editMessage', data.message, 'error');
        }
    } catch (err) {
        showMessage('editMessage', 'Error updating product.', 'error');
    }
});

// ============================================================
// DELETE PRODUCT
// ============================================================
async function deleteProduct(productId, productName) {
    if (!confirm(`Delete "${productName}"? This action cannot be undone.`)) return;
    try {
        const res  = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast(data.message, 'success');
            loadMyProducts();
            loadOverview();
        } else {
            showToast(data.message, 'error');
        }
    } catch (err) {
        showToast('Error deleting product.', 'error');
    }
}

// ============================================================
// PROFILE
// ============================================================
async function loadProfile() {
    const container = document.getElementById('profileSection');
    try {
        const res  = await fetch('/api/users/profile');
        const data = await res.json();
        if (!data.success) return;
        const u = data.user;

        container.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar"><i class="fas fa-user-circle"></i></div>
                <div>
                    <h3>${u.name}</h3>
                    <span class="role-badge role-${u.role.toLowerCase()}">${u.role}</span>
                </div>
            </div>
            <div id="profileMessage" class="message-box hidden"></div>
            <form id="profileForm" class="profile-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="profileName" class="form-control" value="${u.name}" required />
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="tel" id="profilePhone" class="form-control" value="${u.phone || ''}" />
                    </div>
                </div>
                <div class="form-group">
                    <label>Email (read-only)</label>
                    <input type="email" class="form-control" value="${u.email}" disabled />
                </div>
                <div class="form-group">
                    <label>Member Since</label>
                    <input type="text" class="form-control" value="${formatDate(u.created_at)}" disabled />
                </div>
                <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
            </form>`;

        document.getElementById('profileForm').addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const res  = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name:  document.getElementById('profileName').value.trim(),
                    phone: document.getElementById('profilePhone').value.trim()
                })
            });
            const data = await res.json();
            showMessage('profileMessage', data.message, data.success ? 'success' : 'error');
            if (data.success) {
                document.getElementById('sidebarName').textContent = document.getElementById('profileName').value;
            }
        });
    } catch (err) {
        container.innerHTML = '<p class="no-data">Could not load profile.</p>';
    }
}

// ============================================================
// HELPERS
// ============================================================
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Close modals on overlay click
document.getElementById('editModal').addEventListener('click', function(e) {
    if (e.target === this) closeEditModal();
});

// ============================================================
// START
// ============================================================
initDashboard();
