const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConn() {
  console.log("Connecting to Aiven MySQL...");
  for (let i = 1; i <= 5; i++) {
    try {
      const count = await prisma.product.count();
      console.log(`Connection successful on attempt ${i}! Total products: ${count}`);
      await prisma.$disconnect();
      return;
    } catch (err) {
      console.error(`Attempt ${i} failed:`, err.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

testConn();
