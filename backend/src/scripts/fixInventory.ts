import { prisma } from '../config/prisma';

async function main() {
  const products = await prisma.product.findMany({
    include: { inventory: true },
  });

  console.log(`Checking ${products.length} products for inventory records...`);
  let createdCount = 0;

  for (const prod of products) {
    if (!prod.inventory) {
      const inv = await prisma.inventory.create({
        data: {
          productId: prod.id,
          quantity: 25,
          lowStockThreshold: 5,
        },
      });

      await prisma.inventoryTransaction.create({
        data: {
          inventoryId: inv.id,
          productId: prod.id,
          change: 25,
          quantityBefore: 0,
          quantityAfter: 25,
          reason: 'INITIAL_STOCK',
        },
      });

      console.log(`Created inventory record for product "${prod.name}" (${prod.id})`);
      createdCount++;
    }
  }

  console.log(`Successfully created ${createdCount} missing inventory records.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
