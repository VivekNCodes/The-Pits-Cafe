import prisma from '@/lib/prisma';
import { BillingService, CartItemInput } from './billing.service';

export interface CreateOrderInput {
  restaurantId: string;
  orderType: 'DINE_IN' | 'TAKEAWAY';
  tableId?: string;
  tableSessionId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupTime?: string;
  specialInstructions?: string;
  items: CartItemInput[];
  couponCode?: string;
}

export class OrderService {
  /**
   * Generates a clean human-friendly sequential order number (e.g. #1042)
   */
  private static async generateOrderNumber(restaurantId: string): Promise<string> {
    const todayCount = await prisma.order.count({
      where: { restaurantId },
    });
    const num = 1001 + todayCount;
    return `#${num}`;
  }

  /**
   * Validates and creates an order inside a safe database transaction.
   * Recalculates all pricing server-side, takes immutable snapshots of item names and prices.
   */
  static async createOrder(input: CreateOrderInput) {
    if (!input.items || input.items.length === 0) {
      throw new Error('Your cart is empty. Please add items before placing an order.');
    }

    if (!input.customerName || !input.customerPhone) {
      throw new Error('Customer name and contact phone number are required.');
    }

    // Verify restaurant is operational
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: input.restaurantId },
    });
    if (!restaurant) {
      throw new Error('Restaurant not found.');
    }
    if (restaurant.maintenanceMode) {
      throw new Error(restaurant.maintenanceNotice || 'Ordering is temporarily paused by the restaurant.');
    }

    // Verify Dine-in vs Takeaway constraints
    if (input.orderType === 'DINE_IN') {
      if (!restaurant.dineInEnabled) {
        throw new Error('Dine-in ordering is currently disabled for this restaurant.');
      }
      if (!input.tableId) {
        throw new Error('Dine-in orders require a valid table QR scan.');
      }

      // Check table is valid and active
      const table = await prisma.table.findFirst({
        where: { id: input.tableId, restaurantId: input.restaurantId },
        include: { qrCode: true },
      });
      if (!table || !table.qrCode || !table.qrCode.isActive) {
        throw new Error('This table QR is currently inactive. Please ask staff for assistance.');
      }
    } else {
      if (!restaurant.takeawayEnabled) {
        throw new Error('Takeaway ordering is currently disabled for this restaurant.');
      }
    }

    // 1. Authoritative Bill Calculation & Snapshot Preparation
    const bill = await BillingService.calculateBill(
      input.restaurantId,
      input.items,
      input.couponCode
    );

    const orderNumber = await this.generateOrderNumber(input.restaurantId);

    // 2. Commit inside transaction
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          restaurantId: input.restaurantId,
          orderType: input.orderType,
          tableId: input.tableId || null,
          tableSessionId: input.tableSessionId || null,
          customerName: input.customerName.trim(),
          customerPhone: input.customerPhone.trim(),
          customerEmail: input.customerEmail ? input.customerEmail.trim() : null,
          pickupTime: input.pickupTime || null,
          status: 'PENDING',
          subtotal: bill.subtotal,
          discountAmount: bill.discountAmount + bill.couponDiscountAmount,
          discountName: bill.discountName || null,
          couponCode: bill.couponCode || null,
          taxAmount: bill.taxAmount,
          serviceCharge: bill.serviceCharge,
          totalAmount: bill.totalAmount,
          paymentStatus: 'UNPAID',
          specialInstructions: input.specialInstructions || null,
          estimatedMinutes: 20,
          orderItems: {
            create: bill.items.map((item) => ({
              foodItemId: item.foodItemId,
              nameSnapshot: item.name,
              priceSnapshot: item.unitPrice,
              quantity: item.quantity,
              customizations: JSON.stringify(item.addons),
              specialInstructions: item.specialInstructions || null,
              subtotal: item.itemSubtotal,
            })),
          },
          statusHistory: {
            create: {
              toStatus: 'PENDING',
              changedBy: 'Customer',
              note: 'Order placed by customer',
            },
          },
        },
        include: {
          orderItems: true,
          table: true,
          restaurant: true,
        },
      });

      // Update coupon usage count if applied
      if (bill.couponCode) {
        await tx.coupon.updateMany({
          where: { restaurantId: input.restaurantId, code: bill.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      // If dine-in, ensure table is marked occupied
      if (input.tableId) {
        await tx.table.update({
          where: { id: input.tableId },
          data: { status: 'OCCUPIED' },
        });
      }

      return order;
    });
  }

  /**
   * Retrieves an order by ID or OrderNumber for status tracking and digital bill
   */
  static async getOrderDetails(restaurantId: string, orderIdOrNumber: string) {
    return prisma.order.findFirst({
      where: {
        restaurantId,
        OR: [
          { id: orderIdOrNumber },
          { orderNumber: orderIdOrNumber.startsWith('#') ? orderIdOrNumber : `#${orderIdOrNumber}` },
        ],
      },
      include: {
        orderItems: true,
        table: true,
        restaurant: true,
        statusHistory: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });
  }

  /**
   * Updates order status with historical tracking
   */
  static async updateOrderStatus(
    restaurantId: string,
    orderId: string,
    newStatus: string,
    changedBy: string = 'Staff',
    note?: string
  ) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, restaurantId },
    });
    if (!order) {
      throw new Error('Order not found');
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: newStatus,
          changedBy,
          note,
        },
      });

      // If completed or cancelled, free table if all its orders are resolved
      if ((newStatus === 'COMPLETED' || newStatus === 'CANCELLED') && order.tableId) {
        const activeTableOrders = await tx.order.count({
          where: {
            tableId: order.tableId,
            status: { in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'] },
          },
        });
        if (activeTableOrders === 0) {
          await tx.table.update({
            where: { id: order.tableId },
            data: { status: 'AVAILABLE' },
          });
        }
      }

      return updated;
    });
  }

  /**
   * Customer-initiated cancellation (permitted ONLY when still PENDING)
   */
  static async cancelOrderByCustomer(restaurantId: string, orderId: string, reason?: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, restaurantId },
    });
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new Error(
        `Cancellation is no longer available because the kitchen has already ${order.status.toLowerCase()} your order. Please speak directly to restaurant staff.`
      );
    }

    return this.updateOrderStatus(restaurantId, orderId, 'CANCELLED', 'Customer', reason || 'Cancelled by customer');
  }

  /**
   * Marks counter payment as paid
   */
  static async markPaymentPaid(restaurantId: string, orderId: string) {
    return prisma.order.updateMany({
      where: { id: orderId, restaurantId },
      data: { paymentStatus: 'PAID_AT_COUNTER' },
    });
  }

  /**
   * Retrieves order history for a customer phone or email
   */
  static async getCustomerHistory(restaurantId: string, phoneOrEmail: string) {
    return prisma.order.findMany({
      where: {
        restaurantId,
        OR: [{ customerPhone: phoneOrEmail }, { customerEmail: phoneOrEmail }],
      },
      include: {
        orderItems: true,
        table: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  /**
   * Order Again helper: re-creates a cart from an old order by verifying current prices and availability
   */
  static async recreateCartFromOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });
    if (!order) {
      throw new Error('Order not found');
    }

    const itemIds = order.orderItems
      .map((oi) => oi.foodItemId)
      .filter((id): id is string => id !== null);

    const currentItems = await prisma.foodItem.findMany({
      where: { id: { in: itemIds } },
    });

    const itemMap = new Map(currentItems.map((i) => [i.id, i]));
    const cartItems: Array<{
      foodItem: any;
      quantity: number;
      isAvailable: boolean;
      priceChanged: boolean;
      oldPrice: number;
      currentPrice: number;
    }> = [];

    for (const oi of order.orderItems) {
      if (!oi.foodItemId) continue;
      const current = itemMap.get(oi.foodItemId);
      if (!current) continue;

      cartItems.push({
        foodItem: current,
        quantity: oi.quantity,
        isAvailable: current.isAvailable,
        priceChanged: current.price !== oi.priceSnapshot,
        oldPrice: oi.priceSnapshot,
        currentPrice: current.price,
      });
    }

    return {
      restaurantId: order.restaurantId,
      cartItems,
    };
  }

  /**
   * Admin lists orders with real-time filtering
   */
  static async listAdminOrders(restaurantId: string, status?: string) {
    return prisma.order.findMany({
      where: {
        restaurantId,
        ...(status && status !== 'ALL' ? { status } : {}),
      },
      include: {
        orderItems: true,
        table: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
