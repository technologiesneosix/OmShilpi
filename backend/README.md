# Om Shilpi Jewellers - Backend API

Production-level backend platform for **Om Shilpi Jewellers** e-commerce application built with Node.js, Express.js, TypeScript, and Prisma ORM (MySQL / Aiven MySQL).

---

## 🛠️ Technology Stack

- **Runtime:** Node.js (v24+)
- **Framework:** Express.js
- **Language:** TypeScript
- **Database ORM:** Prisma Client & Prisma CLI
- **Database Engine:** Aiven MySQL (Development/Demo) / Hostinger MySQL (Production)
- **Validation:** Zod
- **Logging:** Winston + Morgan
- **Security:** Helmet, CORS

---

## 🏗️ Backend Request Lifecycle Architecture

```text
HTTP Request
    ↓
Express Route (/api/v1/...)
    ↓
Middleware (Helmet, CORS, RequestLogger)
    ↓
Validation (validateRequest using Zod schema)
    ↓
Controller (asyncHandler wrapped controller)
    ↓
Service Layer (Business logic & calculations)
    ↓
Prisma ORM & Aiven MySQL
    ↓
Standardized API Response (ApiResponse.success / ApiResponse.paginated)
```

---

## 📁 Project Structure

```text
backend/
├── src/
│   ├── config/             # Typed environment, Winston logger & Prisma client
│   │   ├── env.ts
│   │   ├── logger.ts
│   │   └── prisma.ts       # Singleton PrismaClient, health check & transaction helper
│   ├── controllers/        # Express controllers (HTTP request/response handling)
│   │   └── health.controller.ts
│   ├── middleware/         # Application middleware
│   │   ├── error.middleware.ts       # Prisma & global error mapping
│   │   ├── notFound.middleware.ts    # 404 handler
│   │   ├── requestLogger.ts         # HTTP request logging via Morgan & Winston
│   │   └── validation.middleware.ts # Zod request validation middleware
│   ├── routes/             # Centralized route definitions
│   │   ├── health.routes.ts
│   │   └── index.ts
│   ├── services/           # Reusable business logic services
│   ├── utils/              # API Error, Response, Async & Pagination utilities
│   │   ├── apiError.ts       # Standardized application error class
│   │   ├── apiResponse.ts    # Success & paginated response helpers
│   │   ├── asyncHandler.ts   # Async controller wrapper
│   │   ├── pagination.ts    # Safe pagination query parser & meta builder
│   │   └── queryHelpers.ts  # Whitelisted field sorting parser
│   ├── types/              # Shared TypeScript types & interfaces
│   │   └── index.ts
│   ├── app.ts              # Express application setup
│   └── server.ts           # Server entry point & graceful shutdown
├── prisma/
│   ├── migrations/         # Prisma database migrations
│   └── schema.prisma       # Full domain schema for Om Shilpi Jewellers
├── postman/                # Postman test collections
├── .env                    # Local environment configuration (ignored by Git)
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

---

## ⚙️ Core Architectural Principles

### 1. Controller / Service Responsibility Separation
- **Controllers:** Accept HTTP requests, invoke middleware/validators, invoke services, and return standardized API responses. Controllers contain **zero** direct SQL/Prisma logic or complex business calculations.
- **Services:** Encapsulate all business rules, database queries, transactions, calculations, and domain logic.

### 2. Validation System (`validateRequest`)
- Request bodies, query parameters, and URL route parameters are validated using Zod schemas via `validateRequest({ body, query, params })`.
- Invalid requests return a standardized `400 Bad Request` with `code: "VALIDATION_ERROR"`.

### 3. Safe Error Handling & Prisma Error Mapping
- `PrismaClientKnownRequestError` instances are mapped automatically:
  - `P2002` (Unique constraint) -> `409 Conflict` (`CONFLICT`)
  - `P2025` (Record not found) -> `404 Not Found` (`NOT_FOUND`)
  - `P2003` (Foreign key violation) -> `400 Bad Request` (`FOREIGN_KEY_VIOLATION`)
- Database credentials, raw SQL strings, and stack traces are **never** exposed in production.

### 4. Safe Pagination & Sorting Utilities
- `parsePagination(query)` safely parses `page` (default `1`) and `limit` (default `20`, max `100`), returning `skip` and `take`.
- `parseSort(sortParam, allowedFields)` validates requested sort fields against a strict whitelist to prevent arbitrary field injection.

### 5. Transaction Strategy (`executeTransaction`)
- Interactive database operations requiring atomicity (e.g. multi-step order placement or inventory reservation) utilize `executeTransaction((tx) => ...)` powered by Prisma's interactive transaction engine.

---

## 🗄️ Database & Prisma Commands

```bash
# Validate Prisma schema
npx prisma validate

# Generate Prisma Client
npm run prisma:generate

# Check migration status
npx prisma migrate status

# Typecheck & build TypeScript
npm run typecheck
npm run build
```

---

## 🏥 Health Endpoint

```text
GET /api/v1/health
```

### Response (`200 OK`):
```json
{
  "success": true,
  "message": "API is healthy",
  "data": {
    "uptime": 6.77,
    "timestamp": "2026-08-14T10:10:05.428Z",
    "service": "Om Shilpi Jewellers Backend",
    "version": "1.0.0",
    "database": "connected"
  }
}
```
