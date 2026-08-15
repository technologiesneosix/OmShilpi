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
│   ├── controllers/        # Express route controllers (Auth, Health, Category, Collection)
│   │   ├── auth.controller.ts
│   │   ├── category.controller.ts
│   │   ├── collection.controller.ts
│   │   └── health.controller.ts
│   ├── middleware/         # Application middleware (Auth, Error, 404, RateLimiter, Validation)
│   ├── routes/             # Centralized route definitions
│   │   ├── auth.routes.ts
│   │   ├── category.routes.ts
│   │   ├── collection.routes.ts
│   │   ├── health.routes.ts
│   │   └── index.ts
│   ├── services/           # Business logic services (Auth, Category, Collection)
│   │   ├── auth.service.ts
│   │   ├── category.service.ts
│   │   └── collection.service.ts
│   ├── utils/              # API Error, Response, Password, Token & Pagination utilities
│   ├── validators/         # Zod schemas (Auth, Category, Collection)
│   │   ├── auth.validator.ts
│   │   ├── category.validator.ts
│   │   └── collection.validator.ts
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

## 💎 Business Domain Architecture

### Category vs Collection Distinction
- **Category:** Functional classification of product type (e.g. *Gold Jewellery*, *Rings*, *Necklaces*).
- **Collection:** Curated marketing / seasonal groupings (e.g. *Bridal Collection*, *Festive Wear*, *Daily Wear*, *New Arrivals*).

### Collection Management Architecture (Phase B7)
- **Public vs Admin Access:** Public endpoints (`/api/v1/collections`) return **only** active collections (`isActive = true`) ordered deterministically (`sortOrder asc`, `name asc`). Admin endpoints (`/api/v1/admin/collections`) require `ADMIN` or `SUPER_ADMIN` authorization. `CUSTOMER` and `STAFF` users receive `403 Forbidden`.
- **Auto-Slug Generation & Uniqueness:** Slugs are auto-generated from collection names (`slugify`) if omitted, or normalized when provided. Duplicate slug attempts return `409 Conflict` (`COLLECTION_SLUG_EXISTS`).
- **Product Association & Deactivation Safety:** Collection deletion checks for associated products (`_count.products > 0`). If products exist, the collection is soft-deactivated (`isActive = false`) rather than deleted, protecting referential integrity.

---

## ⚙️ Collection API Endpoints

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/v1/collections` | `GET` | Public | List all active collections |
| `/api/v1/collections/:slug` | `GET` | Public | Get active collection details by slug |
| `/api/v1/admin/collections` | `POST` | Admin | Create a new collection |
| `/api/v1/admin/collections` | `GET` | Admin | List all collections (with pagination, search, & status filter) |
| `/api/v1/admin/collections/:id` | `GET` | Admin | Get collection details by ID |
| `/api/v1/admin/collections/:id` | `PATCH` | Admin | Update collection details |
| `/api/v1/admin/collections/:id` | `DELETE` | Admin | Delete collection (or soft-deactivate if products exist) |
