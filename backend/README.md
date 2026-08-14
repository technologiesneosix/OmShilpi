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

## 📁 Project Structure

```text
d:/OmShilpi/
├── src/
│   ├── config/             # Typed environment, Winston logger & Prisma client
│   │   ├── env.ts
│   │   ├── logger.ts
│   │   └── prisma.ts       # Singleton PrismaClient & health checker
│   ├── controllers/        # Route controllers
│   │   └── health.controller.ts
│   ├── middleware/         # Application middleware (error, logger, 404)
│   │   ├── error.middleware.ts
│   │   ├── notFound.middleware.ts
│   │   └── requestLogger.ts
│   ├── routes/             # Centralized route definitions
│   │   ├── health.routes.ts
│   │   └── index.ts
│   ├── utils/              # API Error & Response utility classes
│   │   ├── apiError.ts
│   │   └── apiResponse.ts
│   ├── app.ts              # Express application setup
│   └── server.ts           # Server entry point & graceful shutdown
├── prisma/
│   └── schema.prisma       # Prisma MySQL datasource schema
├── .env                    # Local environment configuration (ignored by Git)
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` before running the application:

```bash
cp .env.example .env
```

| Variable | Description | Example / Placeholder |
|---|---|---|
| `NODE_ENV` | Environment mode (`development` \| `production` \| `test`) | `development` |
| `PORT` | HTTP server listening port | `5000` |
| `FRONTEND_URL` | Allowed origin for CORS | `http://localhost:3000` |
| `DATABASE_URL` | MySQL connection string (Aiven / Hostinger) | `mysql://<username>:<password>@<host>:<port>/<database>?ssl-mode=REQUIRED` |

> [!WARNING]
> Never expose or commit real `DATABASE_URL` credentials to Git. Keep `.env` strictly ignored.

---

## 🗄️ Database & Prisma Commands

### 1. Validate Prisma Schema
```bash
npx prisma validate
```

### 2. Generate Prisma Client
```bash
npm run prisma:generate
```

### 3. Migration Workflows
- **Development (Apply migrations safely in dev):**
  ```bash
  npx prisma migrate dev --name <migration_name>
  ```
- **Production (Deploy migrations to production DB):**
  ```bash
  npx prisma migrate deploy
  ```

### 4. Prisma Studio (Database GUI)
Explore and manage database records securely:
```bash
npx prisma studio
```

> [!CAUTION]
> **Strict Database Safety Rule:**
> NEVER execute destructive commands such as `npx prisma migrate reset`, `npx prisma db push --force-reset`, `DROP DATABASE`, or `TRUNCATE`.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npm run prisma:generate
```

### 3. Typecheck & Build
```bash
npm run typecheck
npm run build
```

### 4. Development Mode
```bash
npm run dev
```

### 5. Production Start
```bash
npm start
```

---

## 🏥 Health Endpoint

Verify backend server health and database connectivity:

```text
GET /api/v1/health
```

### Successful Response (`200 OK`):
```json
{
  "success": true,
  "message": "API is healthy",
  "data": {
    "uptime": 14.52,
    "timestamp": "2026-08-14T15:20:00.000Z",
    "service": "Om Shilpi Jewellers Backend",
    "version": "1.0.0",
    "database": "connected"
  }
}
```

---

## 🛡️ Error Response Format

All error responses adhere to a consistent structure:

```json
{
  "success": false,
  "message": "Resource not found",
  "error": {
    "code": "NOT_FOUND"
  }
}
```
