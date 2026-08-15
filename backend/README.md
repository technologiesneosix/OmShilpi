# Om Shilpi Jewellers - Backend API

Production-level backend platform for **Om Shilpi Jewellers** e-commerce application built with Node.js, Express.js, TypeScript, and Prisma ORM (MySQL / Aiven MySQL).

---

## 🛠️ Technology Stack

- **Runtime:** Node.js (v24+)
- **Framework:** Express.js
- **Language:** TypeScript
- **Database ORM:** Prisma Client & Prisma CLI
- **Database Engine:** Aiven MySQL (Development/Demo) / Hostinger MySQL (Production)
- **Media Asset Cloud:** Cloudinary (Images stored on Cloudinary; metadata in MySQL)
- **Authentication:** JWT Access Tokens & Session Refresh Tokens stored in HttpOnly Cookies
- **Password Security:** Bcrypt Work Factor 12
- **Validation:** Zod
- **Logging:** Winston + Morgan
- **Security:** Helmet, CORS (Credentials Allowed), Rate Limiter (`express-rate-limit`)

---

## 📁 Project Structure

```text
backend/
├── src/
│   ├── config/             # Environment, Winston logger, Prisma client & Cloudinary config
│   │   ├── cloudinary.ts
│   │   ├── env.ts
│   │   ├── logger.ts
│   │   └── prisma.ts
│   ├── controllers/        # Express route controllers (Auth, Health, Category, Collection, Product, Inventory, Media, Cart, Wishlist)
│   │   ├── auth.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── category.controller.ts
│   │   ├── collection.controller.ts
│   │   ├── health.controller.ts
│   │   ├── inventory.controller.ts
│   │   ├── media.controller.ts
│   │   ├── product.controller.ts
│   │   └── wishlist.controller.ts
│   ├── middleware/         # Application middleware (Auth, Error, Upload, 404, RateLimiter, Validation)
│   │   ├── auth.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── ...
│   ├── routes/             # Centralized route definitions
│   │   ├── auth.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── category.routes.ts
│   │   ├── collection.routes.ts
│   │   ├── health.routes.ts
│   │   ├── inventory.routes.ts
│   │   ├── media.routes.ts
│   │   ├── product.routes.ts
│   │   ├── wishlist.routes.ts
│   │   └── index.ts
│   ├── services/           # Business logic services
│   │   ├── auth.service.ts
│   │   ├── cart.service.ts
│   │   ├── category.service.ts
│   │   ├── collection.service.ts
│   │   ├── inventory.service.ts
│   │   ├── media.service.ts
│   │   ├── product.service.ts
│   │   └── wishlist.service.ts
│   ├── utils/              # API Error, Response, Password, Token & Pagination utilities
│   ├── validators/         # Zod schemas
│   │   ├── auth.validator.ts
│   │   ├── cart.validator.ts
│   │   ├── category.validator.ts
│   │   ├── collection.validator.ts
│   │   ├── inventory.validator.ts
│   │   ├── media.validator.ts
│   │   ├── product.validator.ts
│   │   └── wishlist.validator.ts
│   ├── types/              # Shared TypeScript types & Express request context
│   ├── app.ts              # Express application setup
│   └── server.ts           # Server entry point & graceful shutdown
├── prisma/
│   ├── migrations/         # Prisma database migrations
│   └── schema.prisma       # Full domain schema for Om Shilpi Jewellers
├── postman/                # Postman test collections
├── .env                    # Local environment configuration (ignored by Git)
├── .env.example            # Environment template
└── README.md               # Project documentation
```

---

## 🛒 Cart & Wishlist Architecture (Phase B11)

### 1. Authoritative Backend Pricing & Calculations
- Subtotal and item totals are computed dynamically using current database `Product.price`. Frontend prices passed in request bodies are ignored.
- **No Stock Deduction / Reservation at Cart Level:** Adding products to the cart checks real-time inventory availability (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`, `UNAVAILABLE`) but DOES NOT alter inventory stock. Stock deduction occurs at checkout/orders.

### 2. Atomic Concurrency & Ownership Security
- Upserting cart items uses `$transaction` blocks to prevent lost-update race conditions.
- Strict per-customer isolation: Customers can only view, update, or clear their own cart/wishlist (`404 CART_ITEM_NOT_FOUND` / `404 WISHLIST_ITEM_NOT_FOUND` on cross-customer item manipulation).

### 3. Business Limits
- **Max Quantity per Cart Item:** 10 units (`CART_ITEM_LIMIT_EXCEEDED`).
- **Max Distinct Items per Cart:** 50 distinct products.
- **Max Wishlist Items:** 100 products.

---

## ⚙️ Cart & Wishlist API Endpoints

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/v1/cart` | `GET` | Customer | Get customer's cart with calculated subtotal, item totals & availability |
| `/api/v1/cart/count` | `GET` | Customer | Lightweight total item quantity count in customer's cart |
| `/api/v1/cart/items` | `POST` | Customer | Add item to cart or increment quantity |
| `/api/v1/cart/items/:itemId` | `PATCH` | Customer | Update quantity of a cart item |
| `/api/v1/cart/items/:itemId` | `DELETE` | Customer | Remove a single item from cart |
| `/api/v1/cart` | `DELETE` | Customer | Clear all items from customer's cart |
| `/api/v1/wishlist` | `GET` | Customer | Get customer's wishlist with product details & availability |
| `/api/v1/wishlist/count` | `GET` | Customer | Get total item count in customer's wishlist |
| `/api/v1/wishlist/items` | `POST` | Customer | Add product to wishlist (prevents duplicates) |
| `/api/v1/wishlist/items/:itemId` | `DELETE` | Customer | Remove item from customer's wishlist |
