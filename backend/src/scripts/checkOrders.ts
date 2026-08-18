import { prisma } from '../config/prisma';

async function main() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  console.log(`Inspecting ${orders.length} orders in database...`);

  for (const order of orders) {
    console.log(`Order #${order.orderNumber} (ID: ${order.id})`);
    console.log(`  Status: ${order.status}, PaymentStatus: ${order.paymentStatus}`);
    console.log(`  Stored Subtotal: ${order.subtotal}, Total: ${order.total}`);
    console.log(`  Shipping Full Name: "${order.shippingFullName}", Phone: "${order.shippingPhone}"`);
    console.log(`  Shipping Address: "${order.shippingAddressLine1}", City: "${order.shippingCity}"`);
    console.log(`  Items count: ${order.items.length}`);

    let calculatedSubtotal = 0;

    for (const item of order.items) {
      console.log(`    Item ${item.id}:`);
      console.log(`      productNameSnapshot: "${item.productNameSnapshot}"`);
      console.log(`      unitPrice: ${item.unitPrice}, totalPrice: ${item.totalPrice}, qty: ${item.quantity}`);
      console.log(`      Linked Product Price: ${item.product?.price}`);

      const effectiveUnitPrice = Number(item.unitPrice) > 0 
        ? Number(item.unitPrice) 
        : (item.product ? Number(item.product.price) : 25000);
      
      const effectiveTotalPrice = effectiveUnitPrice * item.quantity;
      calculatedSubtotal += effectiveTotalPrice;

      // Update OrderItem if prices were 0
      if (Number(item.unitPrice) === 0 || Number(item.totalPrice) === 0) {
        await prisma.orderItem.update({
          where: { id: item.id },
          data: {
            unitPrice: effectiveUnitPrice,
            totalPrice: effectiveTotalPrice,
          },
        });
        console.log(`      -> Fixed OrderItem prices: unitPrice=${effectiveUnitPrice}, totalPrice=${effectiveTotalPrice}`);
      }
    }

    // Update Order subtotal and total if 0
    if (Number(order.subtotal) === 0 || Number(order.total) === 0) {
      const newTotal = calculatedSubtotal;
      await prisma.order.update({
        where: { id: order.id },
        data: {
          subtotal: calculatedSubtotal,
          total: newTotal,
        },
      });
      console.log(`  -> Fixed Order subtotal & total to ₹${newTotal}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
