import prisma from '@/lib/prisma';

export class AnalyticsService {
  /**
   * Generates comprehensive real-time dashboard analytics for a restaurant
   */
  static async getDashboardMetrics(restaurantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Order counts and status breakdown
    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: today },
      },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        paymentStatus: true,
        orderType: true,
      },
    });

    const todayOrdersCount = orders.length;
    const todayRevenue = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
    const preparingCount = orders.filter((o) => o.status === 'PREPARING' || o.status === 'ACCEPTED').length;
    const readyCount = orders.filter((o) => o.status === 'READY').length;
    const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;
    const dineInCount = orders.filter((o) => o.orderType === 'DINE_IN').length;
    const takeawayCount = orders.filter((o) => o.orderType === 'TAKEAWAY').length;

    // 2. Table occupancy
    const tables = await prisma.table.findMany({
      where: { restaurantId },
      select: { id: true, status: true, capacity: true },
    });

    const totalTables = tables.length;
    const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED').length;
    const availableTables = tables.filter((t) => t.status === 'AVAILABLE').length;
    const reservedTables = tables.filter((t) => t.status === 'RESERVED').length;

    // 3. Active reservations for today
    const todayDateStr = new Date().toISOString().split('T')[0];
    const activeReservationsCount = await prisma.reservation.count({
      where: {
        restaurantId,
        reservationDate: todayDateStr,
        status: { in: ['PENDING', 'CONFIRMED', 'ARRIVED'] },
      },
    });

    // 4. Popular Items aggregation
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          restaurantId,
          status: { not: 'CANCELLED' },
        },
      },
      select: {
        nameSnapshot: true,
        quantity: true,
        subtotal: true,
      },
    });

    const itemAggMap = new Map<string, { name: string; totalQuantity: number; totalSales: number }>();
    for (const oi of orderItems) {
      const existing = itemAggMap.get(oi.nameSnapshot) || {
        name: oi.nameSnapshot,
        totalQuantity: 0,
        totalSales: 0,
      };
      existing.totalQuantity += oi.quantity;
      existing.totalSales += oi.subtotal;
      itemAggMap.set(oi.nameSnapshot, existing);
    }

    const popularItems = Array.from(itemAggMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 6);

    // 5. Recent 8 orders for quick activity stream
    const recentOrders = await prisma.order.findMany({
      where: { restaurantId },
      include: {
        orderItems: true,
        table: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    return {
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      todayOrdersCount,
      pendingCount,
      preparingCount,
      readyCount,
      completedCount,
      dineInCount,
      takeawayCount,
      totalTables,
      occupiedTables,
      availableTables,
      reservedTables,
      activeReservationsCount,
      popularItems,
      recentOrders,
    };
  }
}
