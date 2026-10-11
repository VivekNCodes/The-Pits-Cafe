'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  foodItemId: string;
  name: string;
  price: number;
  imageUrl?: string;
  isVeg: boolean;
  quantity: number;
  selectedAddons: Array<{ id: string; name: string; price: number }>;
  specialInstructions?: string;
}

export interface TableContextData {
  tableId: string;
  tableNumber: string;
  tableSlug: string;
  sessionToken?: string;
}

interface BillSummary {
  subtotal: number;
  discountAmount: number;
  discountName?: string;
  couponDiscountAmount: number;
  couponCode?: string;
  taxPercentage: number;
  taxAmount: number;
  serviceCharge: number;
  totalAmount: number;
}

interface CartContextType {
  items: CartItem[];
  tableContext: TableContextData | null;
  orderType: 'DINE_IN' | 'TAKEAWAY';
  couponCode: string;
  billSummary: BillSummary;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (index: number, quantity: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  setTableContext: (ctx: TableContextData | null) => void;
  setOrderType: (type: 'DINE_IN' | 'TAKEAWAY') => void;
  setCouponCode: (code: string) => void;
  recalculateBill: (restaurantSlug: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableContext, setTableContextState] = useState<TableContextData | null>(null);
  const [orderType, setOrderTypeState] = useState<'DINE_IN' | 'TAKEAWAY'>('TAKEAWAY');
  const [couponCode, setCouponCodeState] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [billSummary, setBillSummary] = useState<BillSummary>({
    subtotal: 0,
    discountAmount: 0,
    couponDiscountAmount: 0,
    taxPercentage: 5,
    taxAmount: 0,
    serviceCharge: 0,
    totalAmount: 0,
  });

  // Restore cart and table context from localStorage on client load
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('pit_cafe_cart');
      if (savedCart) setItems(JSON.parse(savedCart));

      const savedTable = localStorage.getItem('pit_cafe_table');
      if (savedTable) {
        const parsed = JSON.parse(savedTable);
        setTableContextState(parsed);
        setOrderTypeState('DINE_IN');
      }

      const savedCoupon = localStorage.getItem('pit_cafe_coupon');
      if (savedCoupon) setCouponCodeState(savedCoupon);
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pit_cafe_cart', JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(() => {
    try {
      if (tableContext) {
        localStorage.setItem('pit_cafe_table', JSON.stringify(tableContext));
      } else {
        localStorage.removeItem('pit_cafe_table');
      }
    } catch {}
  }, [tableContext]);

  const setTableContext = (ctx: TableContextData | null) => {
    setTableContextState(ctx);
    if (ctx) {
      setOrderTypeState('DINE_IN');
    }
  };

  const setOrderType = (type: 'DINE_IN' | 'TAKEAWAY') => {
    setOrderTypeState(type);
  };

  const setCouponCode = (code: string) => {
    setCouponCodeState(code);
    localStorage.setItem('pit_cafe_coupon', code);
  };

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      // Check if duplicate item with same addons exists
      const existingIdx = prev.findIndex(
        (i) =>
          i.foodItemId === newItem.foodItemId &&
          JSON.stringify(i.selectedAddons) === JSON.stringify(newItem.selectedAddons) &&
          i.specialInstructions === newItem.specialInstructions
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }
    setItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setItems([]);
    setCouponCodeState('');
    localStorage.removeItem('pit_cafe_cart');
    localStorage.removeItem('pit_cafe_coupon');
  };

  // Recalculates authoritative bill with the server
  const recalculateBill = async (restaurantSlug: string) => {
    if (items.length === 0) {
      setBillSummary({
        subtotal: 0,
        discountAmount: 0,
        couponDiscountAmount: 0,
        taxPercentage: 5,
        taxAmount: 0,
        serviceCharge: 0,
        totalAmount: 0,
      });
      return;
    }

    try {
      const payload = {
        items: items.map((i) => ({
          foodItemId: i.foodItemId,
          quantity: i.quantity,
          selectedAddonIds: i.selectedAddons.map((a) => a.id),
          specialInstructions: i.specialInstructions,
        })),
        couponCode: couponCode || undefined,
      };

      const res = await fetch(`/api/restaurant/${restaurantSlug}/bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setBillSummary({
          subtotal: data.subtotal,
          discountAmount: data.discountAmount,
          discountName: data.discountName,
          couponDiscountAmount: data.couponDiscountAmount,
          couponCode: data.couponCode,
          taxPercentage: data.taxPercentage,
          taxAmount: data.taxAmount,
          serviceCharge: data.serviceCharge,
          totalAmount: data.totalAmount,
        });
      }
    } catch (e) {
      console.error('Failed to recalculate bill', e);
    }
  };

  // Trigger bill recalculation on item or coupon changes
  useEffect(() => {
    // Quick local estimation while server call settles
    const rawSubtotal = items.reduce((acc, item) => {
      const addonsCost = item.selectedAddons.reduce((sum, a) => sum + a.price, 0);
      return acc + (item.price + addonsCost) * item.quantity;
    }, 0);

    const estTax = Math.round(rawSubtotal * 0.05 * 100) / 100;
    setBillSummary((prev) => ({
      ...prev,
      subtotal: rawSubtotal,
      taxAmount: estTax,
      totalAmount: rawSubtotal + estTax - (prev.discountAmount + prev.couponDiscountAmount),
    }));
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        tableContext,
        orderType,
        couponCode,
        billSummary,
        isCartOpen,
        setIsCartOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        setTableContext,
        setOrderType,
        setCouponCode,
        recalculateBill,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
