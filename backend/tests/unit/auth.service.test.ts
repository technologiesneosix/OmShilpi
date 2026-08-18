import { hashPassword, comparePassword } from '../../src/utils/password';

describe('Auth Unit Tests - Password Hashing & Verification', () => {
  const plainPassword = 'B22SecretPassword@123';

  it('should generate a valid bcrypt hash distinct from plaintext', async () => {
    const hash = await hashPassword(plainPassword);
    expect(hash).toBeDefined();
    expect(hash).not.toEqual(plainPassword);
    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);
  });

  it('should verify the correct password against hash', async () => {
    const hash = await hashPassword(plainPassword);
    const isValid = await comparePassword(plainPassword, hash);
    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const hash = await hashPassword(plainPassword);
    const isValid = await comparePassword('WrongPassword@999', hash);
    expect(isValid).toBe(false);
  });
});
