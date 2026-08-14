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
backend/
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

## 🗄️ Database Schema & Domain Model

### Core Entities & Models (Phase B3)

| Model | Description | Unique Constraints / Indexes |
|---|---|---|
| **User** | Customers, Staff, Admins, Super Admins | Unique `email`, `phone` |
| **Address** | Multiple customer shipping/billing addresses | Indexed `userId` |
| **Category** | Product categorization | Unique `slug` |
| **Collection** | Specialized curated jewellery collections | Unique `slug` |
| **Product** | Comprehensive jewellery products (metal, purity, weights, stone details) | Unique `slug`, `sku`; Decimal prices/weights |
| **ProductImage** | Separate URL metadata for product images | Indexed `productId`, `isPrimary` |
| **Inventory** | Stock quantity & low-stock alerts linked to Product | Unique `productId` |
| **Cart & CartItem** | Customer shopping carts | Unique `userId`; Composite unique `[cartId, productId]` |
| **Wishlist & WishlistItem** | Customer saved items | Unique `userId`; Composite unique `[wishlistId, productId]` |
| **Order & OrderItem** | Complete historical orders with address & price snapshots | Unique `orderNumber`; Decimal total fields |
| **Payment** | Razorpay payment records & statuses | Unique `providerOrderId`, `providerPaymentId` |
| **Enquiry** | Customer contact & jewellery inquiry forms | Indexed `email`, `status` |
| **Banner** | Dynamic homepage marketing banners | Indexed `isActive`, `sortOrder` |
| **Testimonial** | Customer reviews & testimonials | Indexed `isActive`, `sortOrder` |
| **WebsiteContent** | Controlled dynamic website content sections | Unique `key` |

---

## 📐 Key Design Architectural Principles

### 1. Precision Monetary & Weight Types (`Decimal`)
- Prices (`price`, `compareAtPrice`, `subtotal`, `discount`, `tax`, `total`, `amount`) are strictly defined as `@db.Decimal(12, 2)`.
- Weights (`grossWeight`, `netWeight`, `stoneWeight`) are defined as `@db.Decimal(8, 3)`.
- Floating-point representations (`Float`) are strictly avoided for financial precision.

### 2. Historical Order Snapshot Strategy
- Orders preserve the exact shipping address (`shippingFullName`, `shippingPhone`, `shippingAddressLine1`, `shippingCity`, etc.) at the moment of order placement.
- `OrderItem` preserves `productNameSnapshot`, `skuSnapshot`, and `unitPrice` directly on the item record.
- Updating or deleting products or user addresses will **never** alter historical order data.

### 3. Safe Referential Integrity
- `User` -> `Order`: `onDelete: SetNull` (Preserves orders if user account is removed).
- `Product` -> `OrderItem`: `onDelete: SetNull` (Preserves order history if product is archived/deleted).
- `Product` -> `Category`/`Collection`: `onDelete: SetNull` (Preserves product records if a category/collection is removed).
- `User` -> `Address`/`Cart`/`Wishlist`: `onDelete: Cascade`.

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

### 3. Apply Migrations (Dev / Production)
```bash
# Development: Create and apply safe dev migration
npx prisma migrate dev --name <migration_name>

# Production: Apply pending migrations
npx prisma migrate deploy
```

### 4. Prisma Studio
```bash
npx prisma studio
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
