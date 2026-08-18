import { UserRole, OrderStatus, PaymentStatus, EnquiryStatus } from '@prisma/client';
import { prisma } from '../config/prisma';

export class DashboardService {
  /**
   * Aggregates authoritative admin dashboard metrics concurrently.
   */
  static async getAdminDashboardSummary() {
    const [
      totalCustomers,
      totalProducts,
      totalOrders,
      revenueAggregate,
      pendingOrders,
      lowStockResult,
      newEnquiries,
      recentOrdersRaw,
    ] = await Promise.all([
      // 1. Total Customers (role: CUSTOMER)
      prisma.user.count({
        where: { role: UserRole.CUSTOMER },
      }),

      // 2. Total Products (active products)
      prisma.product.count({
        where: { isActive: true },
      }),

      // 3. Total Orders
      prisma.order.count(),

      // 4. Total Revenue (sum of total for orders with paymentStatus: PAID)
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: PaymentStatus.PAID },
      }),

      // 5. Pending Orders (status: PENDING)
      prisma.order.count({
        where: { status: OrderStatus.PENDING },
      }),

      // 6. Low Stock Count (quantity <= lowStockThreshold)
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM Inventory WHERE quantity <= lowStockThreshold
      `,

      // 7. New Enquiries (status: NEW)
      prisma.enquiry.count({
        where: { status: EnquiryStatus.NEW },
      }),

      // 8. Recent Orders (Top 5 sorted by createdAt DESC with safe customer details)
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          currency: true,
          createdAt: true,
          shippingFullName: true,
          shippingPhone: true,
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
    ]);

    const totalRevenue = Number(revenueAggregate._sum.total || 0);
    const lowStock = Number(lowStockResult[0]?.count || 0);

    const recentOrders = recentOrdersRaw.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user?.name || o.shippingFullName || 'Customer',
      customerEmail: o.user?.email || null,
      customerPhone: o.user?.phone || o.shippingPhone || null,
      status: o.status,
      paymentStatus: o.paymentStatus,
      total: Number(o.total),
      currency: o.currency,
      createdAt: o.createdAt,
    }));

    return {
      totalCustomers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStock,
      newEnquiries,
      recentOrders,
    };
  }
}
