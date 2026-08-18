# Om Shilpi Jewels — Frontend Interaction Audit & Fix Plan

## 1. Audit Overview

This document records the exact state of every user-facing interactive control, button, filter, and API integration across the Om Shilpi Jewels store frontend and admin interface.

---

## 2. Identified Frontend Issues & Root Causes

| Page | Interactive Element | Expected Action | Root Cause of Failure | Fix Strategy |
|---|---|---|---|---|
| **Shop** | Product Card Click | Navigate to `/product?slug=...` | Dynamic grid innerHTML was missing `onclick` handler on certain layout variants | Ensure every rendered product card has explicit `onclick` to `/product?slug=...` |
| **Shop** | Add to Wishlist | Add item to customer wishlist | Button selector mismatch (`.group-hover\:opacity-100`) and missing click event propagation stop | Bind delegation listener on `.grid` or explicitly attach `onclick` on rendered cards |
| **Product Detail** | Add to Bag | `POST /api/v1/cart/items` | `document.querySelector('span:contains("SKU")')` threw `DOMException`, breaking script execution before button listener bound | Refactored `product-detail.js` to use clean DOM traversal without invalid `:contains()` pseudo-selectors |
| **Product Detail** | Wishlist Toggle | `POST /api/v1/wishlist/items/:id` | Called `Home.toggleWishlist` when `Home` object was not loaded on product page | Standardize `ProductDetail.toggleWishlist` to call `API.post('/wishlist/items/' + id)` directly |
| **Cart** | Quantity Increment/Decrement | `PATCH /api/v1/cart/items/:id` | Button class mismatch in HTML template (`.qty-inc`, `.qty-dec`) vs JS controller | Bind quantity listeners by data attributes `data-action="increase"` / `data-action="decrease"` |
| **Cart** | Remove Item | `DELETE /api/v1/cart/items/:id` | Item ID attribute was missing in dynamic row renderer | Render `data-item-id="${item.id}"` on delete buttons |
| **Global Header** | Cart / Wishlist Badges | Update badge count on item add/remove | `App.updateCartBadge()` looked for specific element class that differed across template pages | Hardened selector to find any `.shopping_bag` container badge element |
| **Admin Panel** | `/admin` UI | Full Store Management Panel | No `/admin` HTML/JS interface was served by Express | Build complete Vanilla JS Admin Panel served at `/admin` using existing `/api/v1/admin/*` REST APIs |

---

## 3. Verified Backend Admin APIs

The existing backend (`src/routes/admin.routes.ts`) provides full REST endpoints for:
- `POST /api/v1/admin/auth/login` — Admin login & JWT access token dispatch
- `GET /api/v1/admin/dashboard` — Overview metrics (total sales, total orders, total customers, low stock count)
- `GET /api/v1/admin/products` & `POST /api/v1/admin/products` — Product CRUD
- `GET /api/v1/admin/categories` & `POST /api/v1/admin/categories` — Category management
- `GET /api/v1/admin/orders` & `PATCH /api/v1/admin/orders/:id/status` — Order status management
- `GET /api/v1/admin/customers` — Customer user list
- `GET /api/v1/admin/enquiries` — Concierge enquiries list
- `POST /api/v1/admin/media/upload` — Cloudinary image upload helper
