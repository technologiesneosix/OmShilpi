import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/prisma';
import { generateAccessToken } from '../../src/utils/tokens';
import { UserRole } from '@prisma/client';

describe('Security Hardening Integration Tests', () => {
  let customerToken = '';

  beforeAll(async () => {
    const customer = await prisma.user.findFirst({ where: { role: UserRole.CUSTOMER } });
    if (customer) {
      customerToken = generateAccessToken({
        userId: customer.id,
        email: customer.email,
        role: customer.role,
        status: customer.status,
      });
    }
  });

  it('should include Helmet security headers and omit x-powered-by', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('should return 401 for unauthenticated request to protected endpoint', async () => {
    const res = await request(app).get('/api/v1/cart');
    expect(res.status).toBe(401);
  });

  it('should return 403 when customer attempts to access admin endpoint', async () => {
    if (!customerToken) return;
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  it('should reject negative quantities with 400 Bad Request', async () => {
    if (!customerToken) return;
    const product = await prisma.product.findFirst({ where: { isActive: true } });
    if (!product) return;

    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: product.id,
        quantity: -5,
      });

    expect(res.status).toBe(400);
  });
});
