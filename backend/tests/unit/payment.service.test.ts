import crypto from 'crypto';

describe('Payment Unit Tests - Signature Verification Logic', () => {
  const secret = process.env.RAZORPAY_KEY_SECRET || '4tEE4cSEl5NPmxJ92P7HtgoD';
  const orderId = 'order_B22_12345';
  const paymentId = 'pay_B22_67890';

  it('should compute valid HMAC-SHA256 signature over order_id and payment_id', () => {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${orderId}|${paymentId}`);
    const validSignature = hmac.digest('hex');

    expect(validSignature).toBeDefined();
    expect(validSignature.length).toBe(64); // SHA-256 hex string length
  });

  it('should reject timing-mismatched signature', () => {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${orderId}|${paymentId}`);
    const validSignature = hmac.digest('hex');

    const invalidSignature = 'invalid_fake_signature_hash_1234567890';

    const expectedBuf = Buffer.from(validSignature);
    const actualBuf = Buffer.from(invalidSignature);

    let isValid = false;
    if (expectedBuf.length === actualBuf.length) {
      isValid = crypto.timingSafeEqual(expectedBuf, actualBuf);
    }

    expect(isValid).toBe(false);
  });
});
