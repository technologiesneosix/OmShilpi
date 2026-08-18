# Om Shilpi Jewellers - Backend API

Production-level backend platform for **Om Shilpi Jewellers** e-commerce application built with Node.js, Express.js, TypeScript, and Prisma ORM (Aiven MySQL / Hostinger MySQL).

---

## 📚 Interactive API Documentation (Phase B21)

Interactive Swagger UI documentation is available out of the box when running the server:

- **Swagger UI Endpoint:** [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- **Alias UI Endpoint:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Raw OpenAPI JSON Spec:** [http://localhost:5000/api/docs/json](http://localhost:5000/api/docs/json)

### Authorization in Swagger UI:
1. Call `POST /api/v1/auth/login` to obtain your JWT access token.
2. Click the **Authorize** button in Swagger UI.
3. Enter `Bearer <your_jwt_token>` and click Authorize.

---

## 🚀 Production Deployment Guide (Phase B23 - Hostinger + Hostinger MySQL)

### 1. Database Migration Strategy (Aiven MySQL → Hostinger MySQL)
To deploy the backend to production on **Hostinger** with **Hostinger MySQL**:

1. Create a MySQL database in the Hostinger cPanel / hPanel.
2. Set the production environment variable `DATABASE_URL` in `.env` or Hostinger environment configuration:
   ```env
   DATABASE_URL="mysql://HOSTINGER_DB_USER:HOSTINGER_DB_PASS@127.0.0.1:3306/HOSTINGER_DB_NAME?ssl-mode=REQUIRED"
   ```
3. Run the non-destructive production database migration command:
   ```bash
   npx prisma migrate deploy
   ```
   > **CRITICAL:** Always use `npx prisma migrate deploy` in production. **NEVER** run `npx prisma migrate reset` or `npx prisma db push` against a live production database.

### 2. Environment Variables (.env.production)
Copy `.env.production.example` to `.env` on your production server:
```bash
cp .env.production.example .env
```
Ensure real production keys for JWT, Cookie Secret, Cloudinary, and Razorpay live keys are configured.

### 3. Production Build & Start
```bash
# Generate Prisma Client
npm run prisma:generate

# Check TypeScript Compilation
npm run typecheck

# Build Production Dist Bundle
npm run build

# Start Production Server
npm start
```

### 4. Database Backup & Restore Procedure
- **Backup:** Perform regular mysqldump backups before running migrations:
  ```bash
  mysqldump -u HOSTINGER_DB_USER -p HOSTINGER_DB_NAME > omshilpi_backup_$(date +%Y%m%d).sql
  ```
- **Restore:** To restore from backup:
  ```bash
  mysql -u HOSTINGER_DB_USER -p HOSTINGER_DB_NAME < omshilpi_backup_YYYYMMDD.sql
  ```

---

## 🧪 Testing Infrastructure (Phase B22)

Run automated unit, integration, and E2E test suites with Jest & Supertest:

```bash
# Run all test suites
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run end-to-end customer journey tests only
npm run test:e2e

# Generate test coverage report
npm run test:coverage
```

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
- **API Documentation:** OpenAPI 3.0 / Swagger UI (`swagger-ui-express`)
- **Testing:** Jest + Supertest (`ts-jest`)
- **Logging:** Winston + Morgan
- **Security:** Helmet, CORS (Credentials Allowed), Rate Limiter (`express-rate-limit`)

---

## 📁 Project Structure

```text
backend/
├── src/
│   ├── config/             # Environment, Winston logger, Prisma client, Cloudinary & Swagger config
│   │   ├── cloudinary.ts
│   │   ├── env.ts
│   │   ├── logger.ts
│   │   ├── prisma.ts
│   │   └── swagger.ts
│   ├── docs/               # OpenAPI 3.0 specification & schema definitions
│   │   └── openapi.ts
│   ├── controllers/        # Express route controllers
│   ├── middleware/         # Application middleware (Auth, Error, Upload, 404, RateLimiter, Validation)
│   ├── routes/             # Centralized route definitions
│   ├── services/           # Business logic services & audit logging
│   ├── utils/              # API Error, Response, Password, Token & Pagination utilities
│   ├── validators/         # Zod schemas
│   ├── types/              # Shared TypeScript types & Express request context
│   ├── app.ts              # Express application setup & Swagger mounting
│   └── server.ts           # Server entry point & graceful shutdown
├── tests/                  # Phase B22 Jest & Supertest test suites
│   ├── unit/               # Auth, Validator, Inventory, Payment unit tests
│   ├── integration/        # Auth, Product, Cart, Order, Security integration tests
│   └── e2e/                # Critical Customer Flow & Webhook Concurrency tests
├── prisma/
│   ├── migrations/         # Prisma database migrations
│   └── schema.prisma       # Full domain schema for Om Shilpi Jewellers
├── postman/                # Postman test collections (B1-B21)
├── .env                    # Local environment configuration (ignored by Git)
├── .env.example            # Development environment template
├── .env.production.example # Hostinger production environment template
└── README.md               # Project documentation
```

---

## ⚙️ Core API Modules Summary

| Module | Base Path | Description |
|---|---|---|
| **Health** | `/api/v1/health` | Server health check endpoint |
| **Authentication** | `/api/v1/auth` | Customer & Admin login, signup, JWT refresh, password resets |
| **Users & Addresses** | `/api/v1/addresses` | Customer profile & shipping address management |
| **Categories & Collections** | `/api/v1/categories`, `/api/v1/collections` | Product taxonomy & collections |
| **Products & Media** | `/api/v1/products`, `/api/v1/admin/products` | Catalog search, admin product CRUD, Cloudinary upload |
| **Inventory** | `/api/v1/admin/inventory` | Stock management, low stock alert threshold & transaction log |
| **Cart & Wishlist** | `/api/v1/cart`, `/api/v1/wishlist` | Shopping cart & saved wishlist items |
| **Checkout & Orders** | `/api/v1/checkout`, `/api/v1/orders` | Real-time calculation, order creation, order tracking |
| **Payments** | `/api/v1/payments` | Razorpay order creation, payment verification & webhook handling |
| **Enquiries** | `/api/v1/enquiries` | Public contact form submissions & admin status workflow |
| **CMS** | `/api/v1/banners`, `/api/v1/testimonials`, `/api/v1/content` | Banners, reviews, dynamic homepage JSON content |
| **Admin Dashboard** | `/api/v1/admin/dashboard` | Aggregated business metrics, total revenue, low stock & recent orders |
