# Om Shilpi Jewellers - Backend API

Production-level backend platform for **Om Shilpi Jewellers** e-commerce application built with Node.js, Express.js, TypeScript, and Prisma ORM (MySQL / Aiven MySQL).

---

## 🛠️ Technology Stack

- **Runtime:** Node.js (v24+)
- **Framework:** Express.js
- **Language:** TypeScript
- **Database ORM:** Prisma Client & Prisma CLI
- **Database Engine:** Aiven MySQL (Development/Demo) / Hostinger MySQL (Production)
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
│   ├── config/             # Environment, Winston logger & Prisma client
│   ├── controllers/        # Express route controllers (Auth, Health, Category, Collection, Product)
│   │   ├── auth.controller.ts
│   │   ├── category.controller.ts
│   │   ├── collection.controller.ts
│   │   ├── health.controller.ts
│   │   └── product.controller.ts
│   ├── middleware/         # Application middleware (Auth, Error, 404, RateLimiter, Validation)
│   ├── routes/             # Centralized route definitions
│   │   ├── auth.routes.ts
│   │   ├── category.routes.ts
│   │   ├── collection.routes.ts
│   │   ├── health.routes.ts
│   │   ├── product.routes.ts
│   │   └── index.ts
│   ├── services/           # Business logic services (Auth, Category, Collection, Product)
│   │   ├── auth.service.ts
│   │   ├── category.service.ts
│   │   ├── collection.service.ts
│   │   └── product.service.ts
│   ├── utils/              # API Error, Response, Password, Token & Pagination utilities
│   ├── validators/         # Zod schemas (Auth, Category, Collection, Product)
│   │   ├── auth.validator.ts
│   │   ├── category.validator.ts
│   │   ├── collection.validator.ts
│   │   └── product.validator.ts
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

## 💎 Product Management Architecture (Phase B8)

### 1. Public vs Admin Access & Catalog Filtering
- **Public Endpoints (`/api/v1/products`):** Accessible without authentication. Returns **only** active products (`isActive = true`). Supports query parameters: `page`, `limit`, `search`, `category` (slug), `categoryId`, `collection` (slug), `collectionId`, `featured` (`true`), `newArrival` (`true`), `minPrice`, `maxPrice`, `sortBy`, `sortOrder`.
- **Admin Endpoints (`/api/v1/admin/products`):** Strictly protected by `requireAuth` and `requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN)`. `CUSTOMER` and `STAFF` users receive `403 Forbidden`.

### 2. Monetary Precision & Specifications
- Prices are stored and processed with exact Decimal precision (`@db.Decimal(12, 2)`).
- Jewellery specifications supported: `metal`, `purity`, `grossWeight`, `netWeight`, `stoneType`, `stoneWeight`, `certification`.

### 3. SKU & Slug Collision Prevention
- SKUs are unique strings (e.g. `OSJ-GN-001`). Duplicate SKU attempts return `409 Conflict` (`PRODUCT_SKU_EXISTS`).
- Slugs are auto-generated from product names if omitted. Duplicate slug attempts return `409 Conflict` (`PRODUCT_SLUG_EXISTS`).

### 4. Domain Boundaries
- **Inventory Management:** Stock levels and low-stock alerts are handled in Phase B9 (`/api/v1/inventory`).
- **Product Images:** Actual file upload infrastructure is handled in Phase B10.

---

## ⚙️ Product API Endpoints

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/v1/products` | `GET` | Public | List active products (supports category, collection, price range, featured & search filters) |
| `/api/v1/products/:slug` | `GET` | Public | Get active product details by slug |
| `/api/v1/admin/products` | `POST` | Admin | Create a new product |
| `/api/v1/admin/products` | `GET` | Admin | List all products (with status filter, pagination, search & whitelisted sorting) |
| `/api/v1/admin/products/:id` | `GET` | Admin | Get full administrative product details by ID |
| `/api/v1/admin/products/:id` | `PATCH` | Admin | Update product details |
| `/api/v1/admin/products/:id` | `DELETE` | Admin | Delete or soft-deactivate product |
