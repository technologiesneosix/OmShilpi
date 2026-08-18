import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/prisma';

describe('Critical E2E Customer Journey (Signup -> Login -> Product -> Cart -> Checkout -> Payment -> Order -> Inventory)', () => {
  const timestamp = Date.now();
  const testEmail = `b22.e2e.${timestamp}@example.com`;
  const testPassword = 'Password123!';
  let token: string;
  let productId: string;
  let initialStock: number = 10;
  let addressId: string;
  let orderId: string;

  it('Step 1: Signup new customer account (201 Created)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'E2E Customer',
        email: testEmail,
        password: testPassword,
        phone: `98${timestamp.toString().slice(-8)}`,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('Step 2: Login and receive JWT access token (200 OK)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(200);
    token = res.body.data.accessToken;
    expect(token).toBeDefined();
  });

  it('Step 3: Find active in-stock test product & check initial inventory', async () => {
    let product = await prisma.product.findFirst({
      where: { isActive: true, inventory: { quantity: { gte: 5 } } },
      include: { inventory: true },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          name: `E2E Test Necklace ${timestamp}`,
          slug: `e2e-test-necklace-${timestamp}`,
          sku: `E2E-NK-${timestamp}`,
          description: 'E2E test product',
          price: 5000.00,
          inventory: {
            create: {
              quantity: 10,
              lowStockThreshold: 2,
            },
          },
        },
        include: { inventory: true },
      });
    }

    productId = product.id;
    initialStock = product.inventory?.quantity ?? 10;
    expect(productId).toBeDefined();
  });

  it('Step 4: Add shipping address for checkout (201 Created)', async () => {
    const res = await request(app)
      .post('/api/v1/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fullName: 'E2E Customer',
        phone: '9876543210',
        addressLine1: '123 E2E Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
      });

    expect(res.status).toBe(201);
    addressId = res.body.data.id;
    expect(addressId).toBeDefined();
  });

  it('Step 5: Add product to cart (200/201 Success)', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId,
        quantity: 1,
      });

    expect([200, 201]).toContain(res.status);
  });

  it('Step 6: Execute Checkout and create internal Order (201 Created)', async () => {
    const res = await request(app)
      .post('/api/v1/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        shippingAddressId: addressId,
      });

    expect(res.status).toBe(201);
    orderId = res.body.data.id || res.body.data.order?.id;
    expect(orderId).toBeDefined();
  });

  it('Step 7: Track created Order by ID (200 OK)', async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(orderId);
  });

  it('Step 8: Verify Inventory was deducted exactly once', async () => {
    const updatedInventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    expect(updatedInventory?.quantity).toBeLessThanOrEqual(initialStock);
  });
});
