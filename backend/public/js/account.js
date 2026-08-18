/**
 * Om Shilpi Jewels — Account & Order History Controller (Hardened Vanilla JS)
 */
document.addEventListener('DOMContentLoaded', () => {
  Account.init();
});

const Account = {
  async init() {
    if (!API.getToken()) {
      window.location.href = '/login';
      return;
    }
    await this.loadProfile();
    await this.loadOrderHistory();
  },

  async loadProfile() {
    try {
      const res = await API.get('/auth/me');
      if (res.success && res.data) {
        const nameEl = document.querySelector('h2, h3, .font-headline-sm');
        const elements = Array.from(document.querySelectorAll('p, span'));
        const emailEl = elements.find(el => el.children.length === 0 && el.innerText.includes('@'));

        if (nameEl) nameEl.innerText = res.data.name;
        if (emailEl) emailEl.innerText = res.data.email;
      }
    } catch (e) {
      console.warn('Profile load failed:', e);
    }
  },

  async loadOrderHistory() {
    try {
      const res = await API.get('/orders');
      if (res.success && res.data) {
        const orders = Array.isArray(res.data) ? res.data : (res.data.orders || []);
        const container = document.querySelector('div.orders-container, div.space-y-6, table tbody');
        if (!container) return;

        if (orders.length === 0) {
          container.innerHTML = `<div class="py-12 text-center text-on-surface-variant font-body-lg">No orders placed yet.</div>`;
          return;
        }

        container.innerHTML = orders.map(order => {
          const totalFormatted = API.formatPrice(order.total);
          const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

          return `
            <div class="p-6 bg-surface border border-outline-variant/30 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <span class="font-headline-sm text-base text-on-surface">Order #${order.orderNumber}</span>
                  <span class="px-2 py-0.5 text-xs font-bold rounded uppercase ${order.paymentStatus === 'PAID' ? 'bg-success/15 text-success' : 'bg-tertiary/15 text-tertiary'}">${order.paymentStatus}</span>
                </div>
                <div class="text-xs text-on-surface-variant">Placed on ${dateFormatted} • ${order.items?.length || 1} Item(s)</div>
              </div>
              <div class="flex items-center gap-4">
                <span class="font-price-display text-lg font-bold text-on-surface">${totalFormatted}</span>
                <span class="px-3 py-1 bg-surface-container text-xs font-semibold uppercase tracking-wider rounded">${order.status}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (e) {
      console.warn('Order history load failed:', e);
    }
  }
};
