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
│   ├── controllers/        # Express route controllers (Auth, Health, Category, Collection, Product, Inventory, Media, Cart, Wishlist, Address, Order)
│   │   ├── address.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── category.controller.ts
│   │   ├── collection.controller.ts
│   │   ├── health.controller.ts
│   │   ├── inventory.controller.ts
│   │   ├── media.controller.ts
│   │   ├── order.controller.ts
│   │   ├── product.controller.ts
│   │   └── wishlist.controller.ts
│   ├── middleware/         # Application middleware (Auth, Error, Upload, 404, RateLimiter, Validation)
│   │   ├── auth.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── ...
│   ├── routes/             # Centralized route definitions
│   │   ├── address.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── category.routes.ts
│   │   ├── collection.routes.ts
│   │   ├── health.routes.ts
│   │   ├── inventory.routes.ts
│   │   ├── media.routes.ts
│   │   ├── order.routes.ts
│   │   ├── product.routes.ts
│   │   ├── wishlist.routes.ts
│   │   └── index.ts
│   ├── services/           # Business logic services
│   │   ├── address.service.ts
│   │   ├── auth.service.ts
│   │   ├── cart.service.ts
│   │   ├── category.service.ts
│   │   ├── collection.service.ts
│   │   ├── inventory.service.ts
│   │   ├── media.service.ts
│   │   ├── order.service.ts
│   │   ├── product.service.ts
│   │   └── wishlist.service.ts
│   ├── utils/              # API Error, Response, Password, Token & Pagination utilities
│   ├── validators/         # Zod schemas
│   │   ├── address.validator.ts
│   │   ├── auth.validator.ts
│   │   ├── cart.validator.ts
│   │   ├── category.validator.ts
│   │   ├── collection.validator.ts
│   │   ├── inventory.validator.ts
│   │   ├── media.validator.ts
│   │   ├── order.validator.ts
│   │   ├── product.validator.ts
│   │   └── wishlist.validator.ts
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

## 📦 Checkout & Order Architecture (Phase B12)

### 1. Address Management
- Customer shipping addresses are isolated per user (`userId`).
- Managing default addresses uses database transactions to ensure exactly one default address per customer.

### 2. Checkout Preview
- `POST /api/v1/checkout/preview` calculates real-time subtotal, shipping, tax, discount, total, and checks item availability (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`, `UNAVAILABLE`) without mutating database state.

### 3. Server-Side Validations & Atomic Order Placement
- Validates non-empty cart, valid shipping address belonging to customer, active product state, and stock availability.
- Executed inside a Prisma database transaction (`$transaction`):
  1. Generates unique order number `OSJ-ORD-YYYYMMDD-XXXXX`.
  2. Creates `Order` record with historical shipping address snapshot.
  3. Creates `OrderItem` records with historical product name, SKU, and unit price snapshots.
  4. Deducts inventory stock atomically (`quantity = quantity - orderedQuantity`).
  5. Records `InventoryTransaction` with `reason: 'ORDER_CREATED'`.
  6. Clears customer cart items (`CartItem.deleteMany`).

### 4. Order Cancellation & Stock Restoration
- Customers can cancel `PENDING` or `CONFIRMED` orders (`PATCH /api/v1/orders/:id/cancel`).
- Cancellation restores inventory stock atomically inside a transaction and records `InventoryTransaction` with `reason: 'ORDER_CANCELLED'`.

---

## ⚙️ Address, Checkout & Order API Endpoints

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/v1/addresses` | `POST` | Customer | Create shipping address |
| `/api/v1/addresses` | `GET` | Customer | Get customer's saved addresses |
| `/api/v1/addresses/:id` | `GET` | Customer | Get address details by ID |
| `/api/v1/addresses/:id` | `PATCH` | Customer | Update address |
| `/api/v1/addresses/:id` | `DELETE` | Customer | Delete address |
| `/api/v1/addresses/:id/default` | `PATCH` | Customer | Set address as default |
| `/api/v1/checkout/preview` | `POST` | Customer | Generate checkout preview summary |
| `/api/v1/orders` | `POST` | Customer | Place order from customer cart |
| `/api/v1/orders` | `GET` | Customer | Get customer order history (paginated) |
| `/api/v1/orders/:id` | `GET` | Customer | Get order details by ID |
| `/api/v1/orders/:id/cancel` | `PATCH` | Customer | Cancel order (restores stock) |
| `/api/v1/admin/orders` | `GET` | Admin / Staff | Admin list all orders (paginated, filters) |
| `/api/v1/admin/orders/:id/status` | `PATCH` | Admin / Staff | Admin update order status |

---

## 💳 Razorpay Payment Gateway Architecture (Phase B13)

### 1. Razorpay Order Creation
- `POST /api/v1/payments/create-order` creates an external Razorpay Order for an existing internal `PENDING` Order.
- Converts `Order.total` in rupees to paise (`Math.round(total * 100)`). Frontend submitted amounts/currencies are completely ignored.
- Reuses existing pending Razorpay Order if valid, avoiding duplicate provider order creation.

### 2. Server-Side HMAC-SHA256 Signature Verification
- `POST /api/v1/payments/verify` verifies `expectedRazorpayOrderId + '|' + razorpay_payment_id` against `razorpay_signature` using `RAZORPAY_KEY_SECRET` with timing-safe comparison.
- On valid signature, transactionally updates `Payment.status = PAID`, `Order.paymentStatus = PAID`, and `Order.status = CONFIRMED`.

### 3. Webhook Raw-Body Handler & Idempotency Protection
- `POST /api/v1/payments/webhook/razorpay` receives the raw unparsed `Buffer` request body via `express.raw({ type: 'application/json' })` to verify `X-Razorpay-Signature` against `RAZORPAY_WEBHOOK_SECRET`.
- Event idempotency: Stores `X-Razorpay-Event-Id` in `PaymentWebhookEvent` table to prevent duplicate webhook processing or double order state updates.

---

## ⚙️ Payment API Endpoints

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/v1/payments/create-order` | `POST` | Customer | Create or retrieve Razorpay Order for internal Order |
| `/api/v1/payments/verify` | `POST` | Customer | Verify Razorpay payment signature server-side |
| `/api/v1/payments/webhook/razorpay` | `POST` | Public | Razorpay Webhook endpoint (Raw body signature & idempotency) |

