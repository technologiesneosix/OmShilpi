import { signupSchema } from '../../src/validators/auth.validator';
import { createProductSchema } from '../../src/validators/product.validator';
import { addCartItemSchema } from '../../src/validators/cart.validator';

describe('Validator Unit Tests', () => {
  describe('Registration Validator', () => {
    it('should pass valid registration input', () => {
      const result = signupSchema.safeParse({
        name: 'B22 Customer',
        email: 'b22.val@example.com',
        password: 'Password@123',
        phone: '9876543210',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const result = signupSchema.safeParse({
        name: 'B22 Customer',
        email: 'invalid-email-string',
        password: 'Password@123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Product Validator', () => {
    it('should pass valid product input', () => {
      const result = createProductSchema.safeParse({
        name: 'B22 Test Gold Ring',
        sku: 'OSJ-B22-TEST-001',
        price: 45000,
        description: '22k Kundan Gold Ring',
      });
      expect(result.success).toBe(true);
    });

    it('should reject negative price', () => {
      const result = createProductSchema.safeParse({
        name: 'B22 Test Gold Ring',
        sku: 'OSJ-B22-TEST-001',
        price: -500,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Cart Validator', () => {
    it('should reject negative or zero quantity', () => {
      const zeroQty = addCartItemSchema.safeParse({ productId: 'prod123', quantity: 0 });
      const negQty = addCartItemSchema.safeParse({ productId: 'prod123', quantity: -5 });
      expect(zeroQty.success).toBe(false);
      expect(negQty.success).toBe(false);
    });
  });
});
