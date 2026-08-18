/**
 * Om Shilpi Jewels — Shop / Catalog Page Dynamic Hydration Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  Shop.init();
});

const Shop = {
  currentCategory: null,
  currentSort: 'createdAt:desc',

  async init() {
    this.setupFilters();
    await this.loadCategories();
    await this.loadProducts();
  },

  setupFilters() {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.loadProducts({ search: e.target.value.trim() });
      });
    }

    const sortSelect = document.querySelector('select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val.includes('low')) this.currentSort = 'price:asc';
        else if (val.includes('high')) this.currentSort = 'price:desc';
        else this.currentSort = 'createdAt:desc';
        this.loadProducts();
      });
    }
  },

  async loadCategories() {
    try {
      const res = await API.get('/categories');
      if (res.success && res.data) {
        const categories = res.data;
        const filterContainer = document.querySelector('div.flex.gap-4, div.flex.gap-8, nav.categories');
        if (filterContainer) {
          // Render category filter chips
        }
      }
    } catch (e) {
      console.warn('Shop categories fallback:', e);
    }
  },

  async loadProducts(extraParams = {}) {
    try {
      let query = `?sort=${this.currentSort}&limit=12`;
      if (this.currentCategory) query += `&category=${this.currentCategory}`;
      if (extraParams.search) query += `&search=${encodeURIComponent(extraParams.search)}`;

      const res = await API.get(`/products${query}`);
      if (res.success && res.data && res.data.products) {
        const grid = document.querySelector('div.grid.grid-cols-1, div.grid.grid-cols-2, div.grid.grid-cols-3, div.grid.grid-cols-4');
        if (!grid) return;

        if (res.data.products.length === 0) {
          grid.innerHTML = `<div class="col-span-full py-16 text-center text-on-surface-variant font-body-lg">No handcrafted jewellery found matching your criteria.</div>`;
          return;
        }

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
      console.warn('Shop loadProducts fallback:', e);
    }
  }
};
