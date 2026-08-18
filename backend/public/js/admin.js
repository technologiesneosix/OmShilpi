/**
 * Om Shilpi Jewels — Store Manager Admin Panel JavaScript Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});

const AdminApp = {
  async init() {
    this.setupAuthForm();
    this.setupNavigation();
    
    // Check if token exists
    if (API.getToken()) {
      await this.verifyAdminAuth();
    } else {
      this.showLoginView();
    }
  },

  showLoginView() {
    document.getElementById('admin-login-view').classList.remove('hidden');
    document.getElementById('admin-dashboard-view').classList.add('hidden');
  },

  showDashboardView() {
    document.getElementById('admin-login-view').classList.add('hidden');
    document.getElementById('admin-dashboard-view').classList.remove('hidden');
    this.loadOverview();
  },

  setupAuthForm() {
    const form = document.getElementById('admin-login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-email').value.trim();
      const password = document.getElementById('admin-password').value.trim();

      try {
        const res = await API.post('/auth/login', { email, password });
        if (res.success && res.data && res.data.accessToken) {
          const user = res.data.user;
          if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            alert('Access Denied: Only Admin accounts can access this panel.');
            return;
          }
          API.setToken(res.data.accessToken);
          document.getElementById('admin-user-name').innerText = user.name || 'Admin';
          this.showDashboardView();
        } else {
          alert(res.message || 'Authentication failed');
        }
      } catch (err) {
        alert(err.message || 'Admin authentication error');
      }
    });

    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        API.removeToken();
        this.showLoginView();
      });
    }
  },

  async verifyAdminAuth() {
    try {
      const res = await API.get('/auth/me');
      if (res.success && res.data && (res.data.role === 'ADMIN' || res.data.role === 'SUPER_ADMIN')) {
        document.getElementById('admin-user-name').innerText = res.data.name || 'Admin';
        this.showDashboardView();
      } else {
        API.removeToken();
        this.showLoginView();
      }
    } catch (e) {
      API.removeToken();
      this.showLoginView();
    }
  },

  setupNavigation() {
    const navButtons = document.querySelectorAll('.admin-nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        
        // Update active style
        navButtons.forEach(b => {
          b.classList.remove('text-amber-400', 'bg-slate-800/80');
          b.classList.add('text-slate-400');
        });
        btn.classList.add('text-amber-400', 'bg-slate-800/80');
        btn.classList.remove('text-slate-400');

        // Toggle content section
        document.querySelectorAll('.admin-tab-content').forEach(content => {
          content.classList.add('hidden');
        });
        const activeTab = document.getElementById(`tab-${tab}`);
        if (activeTab) activeTab.classList.remove('hidden');

        // Fetch tab data
        if (tab === 'overview') this.loadOverview();
        else if (tab === 'products') this.loadProducts();
        else if (tab === 'categories') this.loadCategories();
        else if (tab === 'inventory') this.loadInventory();
        else if (tab === 'orders') this.loadOrders();
        else if (tab === 'enquiries') this.loadEnquiries();
      });
    });
  },

  async loadOverview() {
    try {
      const res = await API.get('/admin/dashboard');
      if (res.success && res.data) {
        const d = res.data;
        document.getElementById('metric-sales').innerText = API.formatPrice(d.totalRevenue || d.revenue || 0);
        document.getElementById('metric-orders').innerText = d.totalOrders || d.ordersCount || 0;
        document.getElementById('metric-customers').innerText = d.totalCustomers || d.customersCount || 0;
        document.getElementById('metric-lowstock').innerText = d.lowStockCount || d.lowStockProducts || 0;
      }
    } catch (e) {
      console.warn('Dashboard fallback metric loading:', e);
    }
  },

  async loadProducts() {
    const listEl = document.getElementById('admin-products-list');
    try {
      const res = await API.get('/admin/products?limit=50');
      if (res.success && res.data && res.data.products) {
        if (res.data.products.length === 0) {
          listEl.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-400">No products found in database.</td></tr>`;
          return;
        }

        listEl.innerHTML = res.data.products.map(p => `
          <tr class="hover:bg-slate-800/40">
            <td class="p-4 flex items-center gap-3">
              <img src="${p.primaryImage?.url || p.images?.[0]?.url || 'https://via.placeholder.com/40'}" class="w-10 h-10 object-cover rounded-lg bg-slate-800">
              <span class="font-semibold text-white">${p.name}</span>
            </td>
            <td class="p-4 text-xs font-mono text-slate-400">${p.sku || 'OSJ-001'}</td>
            <td class="p-4 text-amber-400 font-semibold">${API.formatPrice(p.price)}</td>
            <td class="p-4 font-semibold ${p.quantity <= p.lowStockThreshold ? 'text-red-400' : 'text-emerald-400'}">${p.quantity}</td>
            <td class="p-4"><span class="px-2.5 py-1 text-[10px] uppercase font-bold rounded-full ${p.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}">${p.isActive ? 'ACTIVE' : 'DRAFT'}</span></td>
          </tr>
        `).join('');
      }
    } catch (e) {
      listEl.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-red-400">Failed to load product catalog.</td></tr>`;
    }
  },

  async loadCategories() {
    const listEl = document.getElementById('admin-categories-list');
    try {
      const res = await API.get('/categories');
      if (res.success && res.data) {
        listEl.innerHTML = res.data.map(c => `
          <div class="p-6 bg-[#1E293B] border border-slate-800 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 class="serif text-lg font-bold text-white mb-1">${c.name}</h3>
              <p class="text-xs text-slate-400">${c.description || 'Jewellery Category'}</p>
            </div>
            <span class="text-xs text-amber-400 font-semibold mt-4 block">Slug: /${c.slug}</span>
          </div>
        `).join('');
      }
    } catch (e) {
      listEl.innerHTML = `<div class="p-6 text-red-400">Failed to load categories</div>`;
    }
  },

  async loadInventory() {
    const listEl = document.getElementById('admin-inventory-list');
    try {
      const res = await API.get('/admin/inventory');
      if (res.success && res.data) {
        const items = res.data.items || res.data;
        listEl.innerHTML = items.map(inv => `
          <tr class="hover:bg-slate-800/40">
            <td class="p-4 font-semibold text-white">${inv.name || inv.product?.name}</td>
            <td class="p-4 font-bold text-amber-400">${inv.quantity}</td>
            <td class="p-4 text-xs text-slate-400">${inv.lowStockThreshold || 5}</td>
            <td class="p-4"><span class="px-2.5 py-1 text-[10px] uppercase font-bold rounded-full ${inv.stockStatus === 'IN_STOCK' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}">${inv.stockStatus || 'IN_STOCK'}</span></td>
          </tr>
        `).join('');
      }
    } catch (e) {
      listEl.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-red-400">Failed to load inventory.</td></tr>`;
    }
  },

  async loadOrders() {
    const listEl = document.getElementById('admin-orders-list');
    try {
      const res = await API.get('/admin/orders?limit=50');
      if (res.success && res.data && res.data.orders) {
        if (res.data.orders.length === 0) {
          listEl.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">No orders found in system.</td></tr>`;
          return;
        }

        listEl.innerHTML = res.data.orders.map(o => `
          <tr class="hover:bg-slate-800/40">
            <td class="p-4 text-xs font-mono text-amber-400 font-bold">${o.orderNumber || o.id}</td>
            <td class="p-4 text-xs text-slate-400">${new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
            <td class="p-4 text-sm text-slate-200">${o.user?.name || o.user?.email || 'Customer'}</td>
            <td class="p-4 font-bold text-white">${API.formatPrice(o.total)}</td>
            <td class="p-4"><span class="px-2.5 py-1 text-[10px] font-bold rounded-full ${o.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">${o.paymentStatus}</span></td>
            <td class="p-4"><span class="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-700 text-slate-300">${o.status}</span></td>
          </tr>
        `).join('');
      }
    } catch (e) {
      listEl.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-red-400">Failed to load orders.</td></tr>`;
    }
  },

  async loadEnquiries() {
    const listEl = document.getElementById('admin-enquiries-list');
    try {
      const res = await API.get('/admin/enquiries');
      if (res.success && res.data) {
        const enquiries = res.data.enquiries || res.data;
        if (enquiries.length === 0) {
          listEl.innerHTML = `<div class="p-6 bg-[#1E293B] border border-slate-800 rounded-2xl text-slate-400 text-center">No customer concierge enquiries recorded.</div>`;
          return;
        }

        listEl.innerHTML = enquiries.map(eq => `
          <div class="p-6 bg-[#1E293B] border border-slate-800 rounded-2xl flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white text-base">${eq.name}</span>
              <span class="text-xs text-amber-400">${eq.email}</span>
            </div>
            <p class="text-sm text-slate-300 bg-[#0F172A] p-4 rounded-xl border border-slate-800">${eq.message}</p>
            <span class="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Submitted: ${new Date(eq.createdAt).toLocaleString('en-IN')}</span>
          </div>
        `).join('');
      }
    } catch (e) {
      listEl.innerHTML = `<div class="p-6 text-red-400">Failed to load concierge enquiries.</div>`;
    }
  }
};
