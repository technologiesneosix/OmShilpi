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
│   ├── controllers/        # Express route controllers (Auth, Health, Category)
│   │   ├── auth.controller.ts
│   │   ├── category.controller.ts
│   │   └── health.controller.ts
│   ├── middleware/         # Application middleware (Auth, Error, 404, RateLimiter, Validation)
│   ├── routes/             # Centralized route definitions
│   │   ├── auth.routes.ts
│   │   ├── category.routes.ts
│   │   ├── health.routes.ts
│   │   └── index.ts
│   ├── services/           # Business logic services (Auth, Category)
│   │   ├── auth.service.ts
│   │   └── category.service.ts
│   ├── utils/              # API Error, Response, Password, Token & Pagination utilities
│   ├── validators/         # Zod schemas (Auth, Category)
│   │   ├── auth.validator.ts
│   │   └── category.validator.ts
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

## 💎 Category Management Architecture (Phase B6)

### 1. Public vs Admin Access
- **Public Endpoints (`/api/v1/categories`):** Accessible without authentication. Returns **only** active categories (`isActive = true`) ordered deterministically (`sortOrder asc`, `name asc`).
- **Admin Endpoints (`/api/v1/admin/categories`):** Strictly protected by `requireAuth` and `requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN)`. `CUSTOMER` and `STAFF` users receive `403 Forbidden`.

### 2. Auto-Slug Generation & Uniqueness
- Slugs are auto-generated from category names (`slugify`) if omitted, or normalized when provided.
- Duplicate slug attempts return `409 Conflict` (`CATEGORY_SLUG_EXISTS`).

### 3. Product Association & Deactivation Safety
- Category deletion checks for associated products (`_count.products > 0`).
- If products exist, the category is safely soft-deactivated (`isActive = false`) rather than deleted, preventing orphan data.

---

## ⚙️ Category API Endpoints

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/v1/categories` | `GET` | Public | List all active categories |
| `/api/v1/categories/:slug` | `GET` | Public | Get active category details by slug |
| `/api/v1/admin/categories` | `POST` | Admin | Create a new category |
| `/api/v1/admin/categories` | `GET` | Admin | List all categories (with pagination, search, & status filter) |
| `/api/v1/admin/categories/:id` | `GET` | Admin | Get category details by ID |
| `/api/v1/admin/categories/:id` | `PATCH` | Admin | Update category details |
| `/api/v1/admin/categories/:id` | `DELETE` | Admin | Delete category (or soft-deactivate if products exist) |
