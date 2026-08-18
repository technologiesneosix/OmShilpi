/**
 * Om Shilpi Jewels — Home Page Dynamic Hydration Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  Home.init();
});

const Home = {
  async init() {
    await this.loadFeaturedProducts();
    await this.loadCMSContent();
  },

  async loadFeaturedProducts() {
    try {
      const res = await API.get('/products?isFeatured=true&limit=4');
      if (res.success && res.data && res.data.products && res.data.products.length > 0) {
        const grid = document.querySelector('section.bg-surface-container-low .grid');
        if (!grid) return;

        grid.innerHTML = res.data.products.map(product => {
          const imgUrl = product.primaryImage?.url || product.images?.[0]?.url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdrCLbclpP63_mtWxmtxpk8yrraXTOPFJ3nn5oMF32ltzxezmRbppTEwTdcebFRMaZj52unsLg1A4fG-WRNzjo2pRGW6tRWcDFo13N58SMTdGrw4cwHaphCyA-E20zfLzr0apgSOVVliL4EN5rJ2VAkyAHustNhXLSPhWQMZi-y5d-jNiHEhvnWCBjcTaNgc3CZztwbEeOqtZLtKDMjz3AY9GnMwebGmIYQ6BDTedq9TJbX53aoNUQ';
          const priceFormatted = API.formatPrice(product.price);

          return `
            <div class="group flex flex-col cursor-pointer" onclick="window.location.href='/product?slug=${product.slug}'">
              <div class="relative aspect-[4/5] overflow-hidden mb-6 bg-surface">
                <img class="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105" alt="${product.name}" src="${imgUrl}"/>
                <button class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-surface/80 backdrop-blur-sm text-on-surface-variant hover:text-error transition-colors rounded-full opacity-0 group-hover:opacity-100" onclick="event.stopPropagation(); Home.toggleWishlist('${product.id}', this)">
                  <span class="material-symbols-outlined">favorite</span>
                </button>
                <div class="absolute bottom-4 left-4">
                  <span class="px-2 py-1 bg-[#064E3B] text-white font-label-caps text-[10px] uppercase tracking-widest">${product.purity || '18K Gold'}</span>
                </div>
              </div>
              <div class="flex flex-col items-center text-center">
                <h4 class="font-body-md text-body-md text-on-surface mb-2 truncate w-full">${product.name}</h4>
                <span class="font-price-display text-price-display text-on-surface-variant">${priceFormatted}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (e) {
      console.warn('Home page featured products fallback to static mock:', e);
    }
  },

  async loadCMSContent() {
    try {
      const res = await API.get('/content/home');
      if (res.success && res.data) {
        const heroTitle = document.querySelector('section h1');
        const heroSubtitle = document.querySelector('section p');
        if (heroTitle && res.data.heroTitle) heroTitle.innerText = res.data.heroTitle;
        if (heroSubtitle && res.data.heroSubtitle) heroSubtitle.innerText = res.data.heroSubtitle;
      }
    } catch (e) {
      // Keep static hero design on failure
    }
  },

  async toggleWishlist(productId, btn) {
    if (!API.getToken()) {
      window.location.href = '/login';
      return;
    }
    try {
      const res = await API.post(`/wishlist/items/${productId}`, {});
      if (res.success) {
        btn.classList.add('text-error');
        alert('Item added to Wishlist');
        App.updateWishlistBadge();
      }
    } catch (e) {
      alert(e.message || 'Failed to update wishlist');
    }
  }
};
