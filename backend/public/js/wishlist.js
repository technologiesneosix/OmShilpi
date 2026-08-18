/**
 * Om Shilpi Jewels — Wishlist Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  Wishlist.init();
});

const Wishlist = {
  async init() {
    if (!API.getToken()) {
      this.renderEmpty('Please sign in to view your saved wishlist items.');
      return;
    }
    await this.loadWishlist();
  },

  async loadWishlist() {
    try {
      const res = await API.get('/wishlist');
      if (res.success && res.data && res.data.items && res.data.items.length > 0) {
        this.renderWishlist(res.data.items);
      } else {
        this.renderEmpty('Your wishlist is currently empty.');
      }
    } catch (e) {
      this.renderEmpty('Your wishlist is currently empty.');
    }
  },

  renderWishlist(items) {
    const grid = document.querySelector('div.grid');
    if (!grid) return;

    grid.innerHTML = items.map(item => {
      const product = item.product;
      const imgUrl = product?.images?.[0]?.url || product?.primaryImage?.url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdrCLbclpP63_mtWxmtxpk8yrraXTOPFJ3nn5oMF32ltzxezmRbppTEwTdcebFRMaZj52unsLg1A4fG-WRNzjo2pRGW6tRWcDFo13N58SMTdGrw4cwHaphCyA-E20zfLzr0apgSOVVliL4EN5rJ2VAkyAHustNhXLSPhWQMZi-y5d-jNiHEhvnWCBjcTaNgc3CZztwbEeOqtZLtKDMjz3AY9GnMwebGmIYQ6BDTedq9TJbX53aoNUQ';
      const priceFormatted = API.formatPrice(product?.price || 0);

      return `
        <div class="group flex flex-col cursor-pointer" onclick="window.location.href='/product?slug=${product?.slug}'">
          <div class="relative aspect-[4/5] overflow-hidden mb-6 bg-surface">
            <img class="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105" alt="${product?.name}" src="${imgUrl}"/>
            <button class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-surface/80 backdrop-blur-sm text-error hover:text-error/80 transition-colors rounded-full" onclick="event.stopPropagation(); Wishlist.removeItem('${product?.id}')">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
          <div class="flex flex-col items-center text-center">
            <h4 class="font-body-md text-body-md text-on-surface mb-2 truncate w-full">${product?.name}</h4>
            <span class="font-price-display text-price-display text-on-surface-variant">${priceFormatted}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  async removeItem(productId) {
    try {
      const res = await API.delete(`/wishlist/items/${productId}`);
      if (res.success) {
        await this.loadWishlist();
        App.updateWishlistBadge();
      }
    } catch (e) {
      alert(e.message || 'Failed to remove item from wishlist');
    }
  },

  renderEmpty(message) {
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <div class="max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop py-24 text-center">
          <span class="material-symbols-outlined text-6xl text-outline mb-4">favorite</span>
          <h2 class="font-headline-md text-headline-md text-on-surface mb-4">Wishlist is Empty</h2>
          <p class="font-body-lg text-on-surface-variant mb-8">${message}</p>
          <a href="/shop" class="px-8 py-4 bg-on-surface text-surface font-label-caps text-label-caps uppercase tracking-widest hover:bg-surface-tint transition-colors inline-block">Discover Jewellery</a>
        </div>
      `;
    }
  }
};
