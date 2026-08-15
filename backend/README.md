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
│   ├── controllers/        # Express route controllers (Auth, Health, Category, Collection, Product, Inventory, Media)
│   │   ├── auth.controller.ts
│   │   ├── category.controller.ts
│   │   ├── collection.controller.ts
│   │   ├── health.controller.ts
│   │   ├── inventory.controller.ts
│   │   ├── media.controller.ts
│   │   └── product.controller.ts
│   ├── middleware/         # Application middleware (Auth, Error, Upload, 404, RateLimiter, Validation)
│   │   ├── auth.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── ...
│   ├── routes/             # Centralized route definitions
│   │   ├── auth.routes.ts
│   │   ├── category.routes.ts
│   │   ├── collection.routes.ts
│   │   ├── health.routes.ts
│   │   ├── inventory.routes.ts
│   │   ├── media.routes.ts
│   │   ├── product.routes.ts
│   │   └── index.ts
│   ├── services/           # Business logic services
│   │   ├── auth.service.ts
│   │   ├── category.service.ts
│   │   ├── collection.service.ts
│   │   ├── inventory.service.ts
│   │   ├── media.service.ts
│   │   └── product.service.ts
│   ├── utils/              # API Error, Response, Password, Token & Pagination utilities
│   ├── validators/         # Zod schemas
│   │   ├── auth.validator.ts
│   │   ├── category.validator.ts
│   │   ├── collection.validator.ts
│   │   ├── inventory.validator.ts
│   │   ├── media.validator.ts
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

## 🖼️ Media & Image Management Architecture (Phase B10)

### 1. Cloud Storage & Metadata Separation
- Actual image files are uploaded directly to **Cloudinary** (`om-shilpi/products`).
- MySQL `ProductImage` table stores metadata (`id`, `productId`, `url`, `publicId`, `altText`, `sortOrder`, `isPrimary`, `createdAt`).

### 2. File Validation & Limits
- **Max File Size:** 10 MB per image (`FILE_TOO_LARGE`).
- **Allowed Formats:** `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/avif` (`INVALID_IMAGE_TYPE`).
- **Max Images per Product:** 10 images limit (`IMAGE_LIMIT_REACHED`).

### 3. Primary Image Atomicity
- Each product has at most ONE primary image (`isPrimary = true`). Primary switches execute inside Prisma `$transaction` blocks.
- Deleting a primary image automatically promotes the next available image to primary.

---

## ⚙️ Media API Endpoints

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/v1/admin/products/:productId/images` | `POST` | Admin | Upload product image file (`multipart/form-data`) |
| `/api/v1/admin/products/:productId/images` | `GET` | Admin | List all product images sorted by sort order |
| `/api/v1/admin/products/:productId/images/:imageId/primary` | `PATCH` | Admin | Atomically set primary image |
| `/api/v1/admin/products/:productId/images/reorder` | `PATCH` | Admin | Reorder product images (`imageIds: string[]`) |
| `/api/v1/admin/products/:productId/images/:imageId` | `PATCH` | Admin | Update image metadata (`altText`, `sortOrder`) |
| `/api/v1/admin/products/:productId/images/:imageId/replace` | `PUT` | Admin | Replace image file asset |
| `/api/v1/admin/products/:productId/images/:imageId` | `DELETE` | Admin | Delete product image & Cloudinary asset |
