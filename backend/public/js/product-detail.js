/**
 * Om Shilpi Jewels — Product Detail Page Dynamic Hydration Controller (Hardened Vanilla JS)
 */
document.addEventListener('DOMContentLoaded', () => {
  ProductDetail.init();
});

const ProductDetail = {
  product: null,

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    let slug = urlParams.get('slug') || urlParams.get('id');

    if (!slug && window.location.pathname.includes('/product/')) {
      slug = window.location.pathname.split('/product/')[1];
    }

    if (slug) {
      await this.loadProduct(slug);
    } else {
      await this.loadFirstProduct();
    }
  },

  async loadFirstProduct() {
    try {
      const res = await API.get('/products?limit=1');
      if (res.success && res.data && res.data.products && res.data.products.length > 0) {
        this.renderProduct(res.data.products[0]);
      }
    } catch (e) {
      console.warn('Fallback to static product detail');
    }
  },

  async loadProduct(slug) {
    try {
      const res = await API.get(`/products/${slug}`);
      if (res.success && res.data) {
        this.renderProduct(res.data);
      }
    } catch (e) {
      console.warn('Product load failed:', e);
    }
  },

  renderProduct(product) {
    this.product = product;

    // Update Title
    const titleEl = document.querySelector('h1, h2.font-display-lg');
    if (titleEl) titleEl.innerText = product.name;

    // Update SKU using clean DOM search
    const spanElements = Array.from(document.querySelectorAll('span, p'));
    const skuEl = spanElements.find(el => el.children.length === 0 && (el.innerText.includes('SKU') || el.innerText.includes('Ref')));
    if (skuEl) skuEl.innerText = `SKU: ${product.sku || 'OSJ-22K-001'}`;

    // Update Price using clean DOM search
    const priceElements = Array.from(document.querySelectorAll('.text-price-display, .font-price-display, .text-2xl, span'));
    const priceEl = priceElements.find(el => el.children.length === 0 && (el.innerText.includes('₹') || el.innerText.includes('$')));
    if (priceEl) priceEl.innerText = API.formatPrice(product.price);

    // Update Images
    const mainImg = document.querySelector('main img, .aspect-\\[4\\/5\\] img');
    if (mainImg && (product.primaryImage?.url || product.images?.[0]?.url)) {
      mainImg.src = product.primaryImage?.url || product.images[0].url;
    }

    // Update Add to Bag Button
    const addBtn = Array.from(document.querySelectorAll('button, a')).find(btn =>
      btn.innerText.toLowerCase().includes('bag') ||
      btn.innerText.toLowerCase().includes('cart') ||
      btn.innerText.toLowerCase().includes('add')
    );
    if (addBtn) {
      addBtn.onclick = (e) => {
        e.preventDefault();
        this.addToCart(product.id);
      };
    }

    // Update Wishlist Button
    const wishlistBtn = Array.from(document.querySelectorAll('button')).find(btn =>
      btn.innerText.toLowerCase().includes('wishlist') ||
      btn.querySelector('.material-symbols-outlined')?.textContent.includes('favorite')
    );
    if (wishlistBtn) {
      wishlistBtn.onclick = (e) => {
        e.preventDefault();
        this.toggleWishlist(product.id, wishlistBtn);
      };
    }
  },

  async addToCart(productId) {
    if (!API.getToken()) {
      alert('Please sign in to add items to your bag.');
      window.location.href = '/login';
      return;
    }

    try {
      const res = await API.post('/cart/items', { productId, quantity: 1 });
      if (res.success) {
        alert('✨ Item added to your bag!');
        App.updateCartBadge();
      } else {
        alert(res.message || 'Failed to add item to bag.');
      }
    } catch (err) {
      alert(err.message || 'Failed to add item to bag.');
    }
  },

  async toggleWishlist(productId, btn) {
    if (!API.getToken()) {
      alert('Please sign in to save items to your wishlist.');
      window.location.href = '/login';
      return;
    }

    try {
      const res = await API.post(`/wishlist/items/${productId}`);
      if (res.success) {
        alert('❤️ Added to Wishlist!');
        App.updateWishlistBadge();
      }
    } catch (err) {
      alert(err.message || 'Failed to update wishlist');
    }
  }
};
