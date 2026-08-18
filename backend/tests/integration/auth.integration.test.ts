import request from 'supertest';
import app from '../../src/app';

describe('Auth Integration Tests', () => {
  const timestamp = Date.now();
  const testEmail = `b22.auth.${timestamp}@example.com`;
  const testPhone = `98${timestamp.toString().slice(-8)}`;
  const testPassword = 'Password@12345';
  let accessToken = '';

  it('should register a new customer account (201 Created)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'B22 Integration Tester',
        email: testEmail,
        password: testPassword,
        phone: testPhone,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('should login with created credentials (200 OK)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();

    accessToken = res.body.data.accessToken;
  });

  it('should retrieve current profile using bearer token (200 OK)', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testEmail);
  });

  it('should reject unauthenticated request to /auth/me (401 Unauthorized)', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});
