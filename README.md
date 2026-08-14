# Om Shilpi Jewellers - Backend API

Production-level backend platform for **Om Shilpi Jewellers** e-commerce application built with Node.js, Express.js, TypeScript, and Prisma ORM (MySQL).

---

## 🛠️ Technology Stack

- **Runtime:** Node.js (v24+)
- **Framework:** Express.js
- **Language:** TypeScript
- **Database ORM:** Prisma (MySQL / Aiven MySQL)
- **Validation:** Zod
- **Logging:** Winston + Morgan
- **Security:** Helmet, CORS

---

## 📁 Project Structure

```text
d:/OmShilpi/
├── src/
│   ├── config/             # Typed environment & logger configuration
│   │   ├── env.ts
│   │   └── logger.ts
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
│   └── schema.prisma       # Prisma datasource schema
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

| Variable | Description | Default / Example |
|---|---|---|
| `NODE_ENV` | Environment mode (`development` \| `production` \| `test`) | `development` |
| `PORT` | HTTP server listening port | `5000` |
| `FRONTEND_URL` | Allowed origin for CORS | `http://localhost:3000` |
| `DATABASE_URL` | MySQL connection string (Aiven / Hostinger) | `mysql://user:pass@host:3306/db?ssl-mode=REQUIRED` |

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

Verify backend server health:

```text
GET /api/v1/health
```

### Sample Response:
```json
{
  "success": true,
  "message": "API is healthy",
  "data": {
    "uptime": 14.52,
    "timestamp": "2026-08-14T15:11:00.000Z",
    "service": "Om Shilpi Jewellers Backend",
    "version": "1.0.0"
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
