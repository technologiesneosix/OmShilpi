import crypto from 'crypto';
import { PaymentService } from '../../src/services/payment.service';

describe('Advanced Concurrency & Idempotency Tests', () => {
  it('should process webhook idempotently and ignore duplicate eventId', async () => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_test_mock_secret_12345';
    const rawBodyBuffer = Buffer.from(JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_idempotency_123',
            order_id: 'order_idempotency_123',
          },
        },
      },
    }));

    const signature = crypto.createHmac('sha256', secret).update(rawBodyBuffer).digest('hex');
    const eventId = `evt_${Date.now()}`;

    // Process event #1 with valid HMAC signature
    const firstRes = await PaymentService.handleWebhook(rawBodyBuffer, signature, eventId);
    expect(firstRes.acknowledged).toBe(true);

    // Process duplicate event #2 with identical eventId & signature
    const secondRes = await PaymentService.handleWebhook(rawBodyBuffer, signature, eventId);
    expect(secondRes.acknowledged).toBe(true);
    expect(secondRes.duplicate).toBe(true);
  });
});
