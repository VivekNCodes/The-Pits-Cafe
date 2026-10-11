import prisma from '@/lib/prisma';

export interface CartItemInput {
  foodItemId: string;
  quantity: number;
  selectedAddonIds?: string[];
  specialInstructions?: string;
}

export interface BillCalculationResult {
  items: Array<{
    foodItemId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    addons: Array<{ id: string; name: string; price: number }>;
    specialInstructions?: string;
    itemSubtotal: number;
  }>;
  subtotal: number;
  discountAmount: number;
  discountName?: string;
  couponDiscountAmount: number;
  couponCode?: string;
  taxPercentage: number;
  taxAmount: number;
  serviceChargePercentage: number;
  serviceCharge: number;
  totalAmount: number;
  warnings?: string[];
}

export class BillingService {
  /**
   * Authoritative server-side bill calculator.
   * Fetches latest menu item prices, validates availability, computes verified discounts and taxes.
   */
  static async calculateBill(
    restaurantId: string,
    cartItems: CartItemInput[],
    couponCode?: string
  ): Promise<BillCalculationResult> {
    const warnings: string[] = [];

    // Fetch restaurant for tax & service charge rates
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    if (cartItems.length === 0) {
      return {
        items: [],
        subtotal: 0,
        discountAmount: 0,
        couponDiscountAmount: 0,
        taxPercentage: restaurant.taxPercentage,
        taxAmount: 0,
        serviceChargePercentage: restaurant.serviceChargePercentage,
        serviceCharge: 0,
        totalAmount: 0,
      };
    }

    const itemIds = cartItems.map((c) => c.foodItemId);
    const dbItems = await prisma.foodItem.findMany({
      where: {
        id: { in: itemIds },
        restaurantId,
      },
      include: {
        category: true,
        addonGroups: {
          include: {
            addons: true,
          },
        },
      },
    });

    const dbItemMap = new Map(dbItems.map((item) => [item.id, item]));

    let rawSubtotal = 0;
    const computedItems: BillCalculationResult['items'] = [];

    for (const input of cartItems) {
      const dbItem = dbItemMap.get(input.foodItemId);
      if (!dbItem) {
        throw new Error(`Menu item not found or does not belong to this restaurant.`);
      }
      if (!dbItem.isAvailable) {
        throw new Error(`"${dbItem.name}" is currently sold out and unavailable.`);
      }

      const quantity = Math.max(1, input.quantity);

      // Validate and compute add-ons
      const selectedAddons: Array<{ id: string; name: string; price: number }> = [];
      let addonsPrice = 0;

      if (input.selectedAddonIds && input.selectedAddonIds.length > 0) {
        // Collect all available addons for this item's groups
        const availableAddons = dbItem.addonGroups.flatMap((ag) => ag.addons);
        for (const addonId of input.selectedAddonIds) {
          const matched = availableAddons.find((a) => a.id === addonId);
          if (matched && matched.isAvailable) {
            selectedAddons.push({
              id: matched.id,
              name: matched.name,
              price: matched.price,
            });
            addonsPrice += matched.price;
          }
        }
      }

      const unitTotal = dbItem.price + addonsPrice;
      const lineSubtotal = unitTotal * quantity;
      rawSubtotal += lineSubtotal;

      computedItems.push({
        foodItemId: dbItem.id,
        name: dbItem.name,
        unitPrice: dbItem.price,
        quantity,
        addons: selectedAddons,
        specialInstructions: input.specialInstructions,
        itemSubtotal: lineSubtotal,
      });
    }

    // 1. Evaluate Active Restaurant/Item/Category Discounts
    let generalDiscountAmount = 0;
    let appliedDiscountName: string | undefined = undefined;

    const activeDiscounts = await prisma.discount.findMany({
      where: {
        restaurantId,
        isActive: true,
      },
    });

    // Pick best eligible discount
    for (const d of activeDiscounts) {
      if (rawSubtotal < d.minOrderValue) continue;

      let dAmount = 0;
      if (d.discountType === 'FLAT') {
        dAmount = d.discountValue;
      } else if (d.discountType === 'PERCENTAGE') {
        dAmount = (rawSubtotal * d.discountValue) / 100;
        if (d.maxDiscount && dAmount > d.maxDiscount) {
          dAmount = d.maxDiscount;
        }
      }

      if (dAmount > generalDiscountAmount) {
        generalDiscountAmount = dAmount;
        appliedDiscountName = d.title;
      }
    }

    // 2. Evaluate Coupon if provided
    let couponDiscountAmount = 0;
    let appliedCouponCode: string | undefined = undefined;

    if (couponCode && couponCode.trim() !== '') {
      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = await prisma.coupon.findUnique({
        where: {
          restaurantId_code: {
            restaurantId,
            code: cleanCode,
          },
        },
      });

      if (!coupon) {
        warnings.push(`Coupon "${cleanCode}" is invalid.`);
      } else if (!coupon.isActive) {
        warnings.push(`Coupon "${cleanCode}" has expired.`);
      } else if (rawSubtotal < coupon.minOrderValue) {
        warnings.push(`Coupon requires a minimum order value of ₹${coupon.minOrderValue}.`);
      } else {
        if (coupon.discountType === 'FLAT') {
          couponDiscountAmount = coupon.discountValue;
        } else if (coupon.discountType === 'PERCENTAGE') {
          couponDiscountAmount = (rawSubtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && couponDiscountAmount > coupon.maxDiscount) {
            couponDiscountAmount = coupon.maxDiscount;
          }
        }
        appliedCouponCode = coupon.code;
      }
    }

    // Combine discounts without exceeding subtotal
    const totalDiscount = Math.min(rawSubtotal, generalDiscountAmount + couponDiscountAmount);
    const discountedSubtotal = Math.max(0, rawSubtotal - totalDiscount);

    // 3. Taxes & Service Charges
    const taxAmount = Math.round(((discountedSubtotal * restaurant.taxPercentage) / 100) * 100) / 100;
    const serviceCharge = Math.round(((discountedSubtotal * restaurant.serviceChargePercentage) / 100) * 100) / 100;
    const finalAmount = Math.round((discountedSubtotal + taxAmount + serviceCharge) * 100) / 100;

    return {
      items: computedItems,
      subtotal: Math.round(rawSubtotal * 100) / 100,
      discountAmount: Math.round(generalDiscountAmount * 100) / 100,
      discountName: appliedDiscountName,
      couponDiscountAmount: Math.round(couponDiscountAmount * 100) / 100,
      couponCode: appliedCouponCode,
      taxPercentage: restaurant.taxPercentage,
      taxAmount,
      serviceChargePercentage: restaurant.serviceChargePercentage,
      serviceCharge,
      totalAmount: finalAmount,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
