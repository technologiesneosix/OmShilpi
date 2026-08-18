/**
 * Om Shilpi Jewels — Bag / Cart Dynamic Hydration Controller (Hardened Vanilla JS)
 */
document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
});

const Cart = {
  cart: null,

  async init() {
    if (!API.getToken()) {
      this.renderEmptyCart('Please sign in to view your shopping bag.');
      return;
    }
    await this.loadCart();
  },

  async loadCart() {
    try {
      const res = await API.get('/cart');
      if (res.success && res.data) {
        this.cart = res.data;
        this.renderCart();
      }
    } catch (e) {
      this.renderEmptyCart('Your bag is currently empty.');
    }
  },

  renderCart() {
    if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
      this.renderEmptyCart('Your bag is currently empty.');
      return;
    }

    const itemsContainer = document.querySelector('div.flex.flex-col.gap-8, div.space-y-6, main .grid > div:first-child');
    if (itemsContainer) {
      itemsContainer.innerHTML = this.cart.items.map(item => {
        const product = item.product;
        const imgUrl = product?.images?.[0]?.url || product?.primaryImage?.url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdrCLbclpP63_mtWxmtxpk8yrraXTOPFJ3nn5oMF32ltzxezmRbppTEwTdcebFRMaZj52unsLg1A4fG-WRNzjo2pRGW6tRWcDFo13N58SMTdGrw4cwHaphCyA-E20zfLzr0apgSOVVliL4EN5rJ2VAkyAHustNhXLSPhWQMZi-y5d-jNiHEhvnWCBjcTaNgc3CZztwbEeOqtZLtKDMjz3AY9GnMwebGmIYQ6BDTedq9TJbX53aoNUQ';
        const priceFormatted = API.formatPrice(product?.price || 0);
        const itemTotalFormatted = API.formatPrice((product?.price || 0) * item.quantity);

        return `
          <div class="flex gap-6 pb-6 border-b border-outline-variant/30 items-center justify-between">
            <div class="flex gap-6 items-center">
              <img src="${imgUrl}" alt="${product?.name}" class="w-24 h-28 object-cover bg-surface">
              <div class="flex flex-col gap-1">
                <h3 class="font-headline-sm text-lg text-on-surface">${product?.name || 'Handcrafted Jewellery'}</h3>
                <span class="font-label-caps text-xs text-on-surface-variant">SKU: ${product?.sku || 'OSJ-001'}</span>
                <span class="font-price-display text-sm text-tertiary mt-1">${priceFormatted}</span>
              </div>
            </div>
            <div class="flex items-center gap-6">
              <div class="flex items-center border border-outline-variant rounded px-3 py-1 gap-3">
                <button onclick="Cart.updateQuantity('${item.id}', ${item.quantity - 1})" class="text-on-surface-variant hover:text-on-surface font-bold">-</button>
                <span class="font-body-md text-sm">${item.quantity}</span>
                <button onclick="Cart.updateQuantity('${item.id}', ${item.quantity + 1})" class="text-on-surface-variant hover:text-on-surface font-bold">+</button>
              </div>
              <span class="font-price-display text-base font-bold text-on-surface">${itemTotalFormatted}</span>
              <button onclick="Cart.removeItem('${item.id}')" class="text-on-surface-variant hover:text-error">
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Update Subtotal and Summary using clean DOM selection
    const subtotal = this.cart.items.reduce((acc, item) => acc + (Number(item.product?.price || 0) * item.quantity), 0);
    const priceElements = Array.from(document.querySelectorAll('.font-price-display, .text-xl.font-bold, span'));
    const subtotalEl = priceElements.find(el => el.children.length === 0 && (el.innerText.includes('₹') || el.innerText.includes('Subtotal')));
    if (subtotalEl) {
      subtotalEl.innerText = API.formatPrice(subtotal);
    }

    // Bind Checkout Button
    const checkoutBtn = Array.from(document.querySelectorAll('button, a')).find(el => el.innerText.toLowerCase().includes('checkout') || el.innerText.toLowerCase().includes('proceed'));
    if (checkoutBtn) {
      checkoutBtn.onclick = (e) => {
        e.preventDefault();
        window.location.href = '/checkout';
      };
    }
  },

  async updateQuantity(itemId, quantity) {
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }
    try {
      const res = await API.patch(`/cart/items/${itemId}`, { quantity });
      if (res.success) {
        await this.loadCart();
        App.updateCartBadge();
      }
    } catch (e) {
      alert(e.message || 'Failed to update quantity');
    }
  },

  async removeItem(itemId) {
    try {
      const res = await API.delete(`/cart/items/${itemId}`);
      if (res.success) {
        await this.loadCart();
        App.updateCartBadge();
      }
    } catch (e) {
      alert(e.message || 'Failed to remove item');
    }
  },

  renderEmptyCart(message) {
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <div class="max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop py-24 text-center">
          <span class="material-symbols-outlined text-6xl text-outline mb-4">shopping_bag</span>
          <h2 class="font-headline-md text-headline-md text-on-surface mb-4">Your Bag is Empty</h2>
          <p class="font-body-lg text-on-surface-variant mb-8">${message}</p>
          <a href="/shop" class="px-8 py-4 bg-on-surface text-surface font-label-caps text-label-caps uppercase tracking-widest hover:bg-surface-tint transition-colors inline-block">Explore Jewellery</a>
        </div>
      `;
    }
  }
};
