import { prisma } from '../src/config/prisma';

beforeAll(async () => {
  try {
    await prisma.$connect();
  } catch (e) {
    // Connection attempt warning fallback
  }
});

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch (e) {
    // Disconnect cleanup fallback
  }
});
