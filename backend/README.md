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
│   ├── controllers/        # Express route controllers (Auth, Health, Category, Collection, Product, Inventory)
│   │   ├── auth.controller.ts
│   │   ├── category.controller.ts
│   │   ├── collection.controller.ts
│   │   ├── health.controller.ts
│   │   ├── inventory.controller.ts
│   │   └── product.controller.ts
│   ├── middleware/         # Application middleware (Auth, Error, 404, RateLimiter, Validation)
│   ├── routes/             # Centralized route definitions
│   │   ├── auth.routes.ts
│   │   ├── category.routes.ts
│   │   ├── collection.routes.ts
│   │   ├── health.routes.ts
│   │   ├── inventory.routes.ts
│   │   ├── product.routes.ts
│   │   └── index.ts
│   ├── services/           # Business logic services (Auth, Category, Collection, Product, Inventory)
│   │   ├── auth.service.ts
│   │   ├── category.service.ts
│   │   ├── collection.service.ts
│   │   ├── inventory.service.ts
│   │   └── product.service.ts
│   ├── utils/              # API Error, Response, Password, Token & Pagination utilities
│   ├── validators/         # Zod schemas (Auth, Category, Collection, Product, Inventory)
│   │   ├── auth.validator.ts
│   │   ├── category.validator.ts
│   │   ├── collection.validator.ts
│   │   ├── inventory.validator.ts
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

## 📦 Inventory & Stock Management Architecture (Phase B9)

### 1. Atomic Stock Adjustments & Concurrency Safeguards
- All stock mutations (`PATCH /api/v1/admin/inventory/:productId/adjust` and `PATCH /api/v1/admin/inventory/:productId/stock`) execute inside Prisma `$transaction` blocks.
- **Negative Stock Prevention:** If an adjustment attempt would result in `quantity < 0`, the transaction fails safely returning `400 Bad Request` (`INSUFFICIENT_STOCK`).

### 2. Inventory Movement Traceability & Audit History
- Every stock change creates an immutable `InventoryTransaction` record documenting `inventoryId`, `productId`, `change`, `quantityBefore`, `quantityAfter`, `reason` (e.g. `INITIAL_STOCK`, `NEW_STOCK`, `PHYSICAL_AUDIT`, `DAMAGED_ITEM`), and admin `createdBy`.
- Accessible via `GET /api/v1/admin/inventory/:productId/history`.

### 3. Public Availability Indicator
- Public product responses expose an availability state (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`) without exposing raw internal stock quantity numbers or threshold settings.

---

## ⚙️ Inventory API Endpoints

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/v1/admin/inventory` | `POST` | Admin | Create initial inventory record for a product |
| `/api/v1/admin/inventory` | `GET` | Admin | List all inventory records (supports status filter: `in_stock`, `low_stock`, `out_of_stock`, search & pagination) |
| `/api/v1/admin/inventory/low-stock` | `GET` | Admin | Get products with low stock (`0 < quantity <= lowStockThreshold`) |
| `/api/v1/admin/inventory/out-of-stock` | `GET` | Admin | Get out-of-stock products (`quantity = 0`) |
| `/api/v1/admin/inventory/:productId` | `GET` | Admin | Get inventory details & computed availability by product ID |
| `/api/v1/admin/inventory/:productId` | `PATCH` | Admin | Update low stock threshold configuration |
| `/api/v1/admin/inventory/:productId/adjust` | `PATCH` | Admin | Atomically adjust stock (+N or -N) with audit log & negative stock check |
| `/api/v1/admin/inventory/:productId/stock` | `PATCH` | Admin | Atomically set stock to exact quantity with audit log |
| `/api/v1/admin/inventory/:productId/history` | `GET` | Admin | Get paginated inventory audit transaction history |
