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

## 🔐 Authentication & Authorization Architecture

### 1. Token & Cookie Strategy
- **Access Token:** Short-lived JWT (15 min) stored in HttpOnly cookie `omshilpi_access_token`.
- **Refresh Token:** Long-lived JWT (7 days) stored in HttpOnly cookie `omshilpi_refresh_token` and persisted as SHA-256 hash in database (`RefreshToken` table).
- **Cookie Flags:** `HttpOnly: true`, `SameSite: lax`, `Secure: false` (in dev) / `true` (in production), `Path: '/'`.
- **Token Protection:** Tokens are **never** accessible to browser JavaScript (`localStorage` / `sessionStorage` strictly avoided).

### 2. Role-Based Access Control (RBAC)
- **`CUSTOMER`**: Default role assigned to all public signups. Role tampering attempts on signup are strictly ignored.
- **`STAFF`**: Staff operations.
- **`ADMIN` / `SUPER_ADMIN`**: Full administrative operations. Accessible via `requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN)`.

### 3. Password Reset Workflow
- Generates cryptographically random 32-byte token (`crypto.randomBytes(32)`).
- Stores SHA-256 hash in `PasswordResetToken` table with 15-minute expiration.
- Password reset automatically invalidates user's active sessions.
- In production, email integration point is prepared (deferred to Phase B17).

---

## 📁 Project Structure

```text
backend/
├── src/
│   ├── config/             # Environment, Winston logger & Prisma client
│   │   ├── env.ts
│   │   ├── logger.ts
│   │   └── prisma.ts
│   ├── controllers/        # Express route controllers
│   │   ├── auth.controller.ts # Signup, Login, Logout, Me, Password reset
│   │   └── health.controller.ts
│   ├── middleware/         # Application middleware
│   │   ├── auth.middleware.ts        # requireAuth & requireRole middlewares
│   │   ├── error.middleware.ts       # Global error & Prisma error mapping
│   │   ├── notFound.middleware.ts    # 404 handler
│   │   ├── rateLimiter.middleware.ts # Rate limiting for auth routes
│   │   ├── requestLogger.ts         # Request logger via Morgan & Winston
│   │   └── validation.middleware.ts # Zod request validation middleware
│   ├── routes/             # Centralized route definitions
│   │   ├── auth.routes.ts   # /api/v1/auth endpoints
│   │   ├── health.routes.ts
│   │   └── index.ts
│   ├── services/           # Business logic services
│   │   └── auth.service.ts  # Authentication service logic
│   ├── utils/              # API Error, Response, Password & Token utilities
│   │   ├── apiError.ts
│   │   ├── apiResponse.ts
│   │   ├── asyncHandler.ts
│   │   ├── pagination.ts
│   │   ├── password.ts      # Bcrypt password hashing
│   │   ├── queryHelpers.ts
│   │   └── tokens.ts        # JWT & crypto SHA-256 token hashing
│   ├── validators/         # Zod schemas
│   │   └── auth.validator.ts
│   ├── types/              # Shared TypeScript types & Express request context
│   │   └── index.ts
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

## ⚙️ Authentication API Endpoints

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/v1/auth/signup` | `POST` | Public | Customer registration (Forces `role: CUSTOMER`) |
| `/api/v1/auth/login` | `POST` | Public | User login (Sets HttpOnly auth cookies) |
| `/api/v1/auth/logout` | `POST` | Public / Auth | User logout (Clears cookies & revokes session) |
| `/api/v1/auth/me` | `GET` | Protected | Current user profile details |
| `/api/v1/auth/password` | `PATCH` | Protected | Change account password |
| `/api/v1/auth/forgot-password` | `POST` | Public | Request password reset token |
| `/api/v1/auth/reset-password` | `POST` | Public | Reset password using reset token |
| `/api/v1/auth/admin/test` | `GET` | Admin | Protected verification route for `ADMIN` / `SUPER_ADMIN` |

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
