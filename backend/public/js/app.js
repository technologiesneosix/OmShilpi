/**
 * Om Shilpi Jewels — Global App Controller (Hardened Vanilla JS)
 * Controls header navigation, cart badge counts, wishlist badge counts, auth state, and page routing.
 */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  async init() {
    this.setupHeaderLinks();
    this.updateCartBadge();
    this.updateWishlistBadge();
    this.updateAuthState();
  },

  setupHeaderLinks() {
    // Bind navigation links cleanly to backend HTML routes
    document.querySelectorAll('a[href="#"], a[data-path]').forEach(el => {
      const path = el.getAttribute('data-path') || el.innerText.trim().toLowerCase();
      if (path === 'collections' || path === 'jewellery' || path === 'shop' || path === 'shop all') {
        el.setAttribute('href', '/shop');
      } else if (path === 'about' || path === 'heritage' || path === 'our story') {
        el.setAttribute('href', '/heritage');
      } else if (path === 'contact' || path === 'concierge') {
        el.setAttribute('href', '/contact');
      } else if (path === 'journal') {
        el.setAttribute('href', '/journal');
      }
    });

    // Bind header icon buttons
    document.querySelectorAll('button').forEach(btn => {
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) {
        const text = icon.textContent.trim();
        if (text === 'search') {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const query = prompt('Search Om Shilpi Jewels:');
            if (query && query.trim()) {
              window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
            }
          });
        } else if (text === 'favorite') {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/wishlist';
          });
        } else if (text === 'shopping_bag') {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/cart';
          });
        }
      }
    });

    // Logo click redirect to Home
    document.querySelectorAll('.brand-logo, header span.font-headline-sm').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        window.location.href = '/';
      });
    });
  },

  async updateCartBadge() {
    if (!API.getToken()) return;

    try {
      const res = await API.get('/cart');
      if (res.success && res.data && res.data.items) {
        const totalItems = res.data.items.reduce((acc, item) => acc + item.quantity, 0);
        document.querySelectorAll('header button .material-symbols-outlined').forEach(icon => {
          if (icon.textContent.trim() === 'shopping_bag') {
            let badgeEl = icon.parentElement.querySelector('span.absolute');
            if (!badgeEl) {
              badgeEl = document.createElement('span');
              badgeEl.className = 'absolute -top-1 -right-1 bg-tertiary text-on-tertiary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold';
              icon.parentElement.appendChild(badgeEl);
            }
            badgeEl.textContent = totalItems;
            badgeEl.style.display = totalItems > 0 ? 'flex' : 'none';
          }
        });
      }
    } catch (e) {
      // Silent catch for guest / unauthenticated state
    }
  },

  async updateWishlistBadge() {
    if (!API.getToken()) return;
    try {
      const res = await API.get('/wishlist');
      if (res.success && res.data && res.data.items) {
        const count = res.data.items.length;
        document.querySelectorAll('header button .material-symbols-outlined').forEach(icon => {
          if (icon.textContent.trim() === 'favorite') {
            let badgeEl = icon.parentElement.querySelector('span.absolute');
            if (!badgeEl && count > 0) {
              badgeEl = document.createElement('span');
              badgeEl.className = 'absolute -top-1 -right-1 bg-error text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold';
              icon.parentElement.appendChild(badgeEl);
            }
            if (badgeEl) {
              badgeEl.textContent = count;
              badgeEl.style.display = count > 0 ? 'flex' : 'none';
            }
          }
        });
      }
    } catch (e) {
      // Silent catch for guest wishlist state
    }
  },

  async updateAuthState() {
    const profileContainers = document.querySelectorAll('header .flex.items-center.gap-2.pl-4');
    if (!profileContainers.length) return;

    const token = API.getToken();
    if (token) {
      try {
        const res = await API.get('/auth/me');
        if (res.success && res.data) {
          profileContainers.forEach(container => {
            container.style.cursor = 'pointer';
            container.onclick = () => window.location.href = '/account';
          });
        }
      } catch (e) {
        API.removeToken();
      }
    } else {
      profileContainers.forEach(container => {
        container.style.cursor = 'pointer';
        container.onclick = () => window.location.href = '/login';
      });
    }
  }
};
