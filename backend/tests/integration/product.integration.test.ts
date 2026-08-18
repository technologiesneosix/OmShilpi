import request from 'supertest';
import app from '../../src/app';

describe('Product Integration Tests', () => {
  it('should list public active products (200 OK)', async () => {
    const res = await request(app).get('/api/v1/products?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return 404 for non-existent product slug', async () => {
    const res = await request(app).get('/api/v1/products/non-existent-product-slug-12345');
    expect(res.status).toBe(404);
  });
});
