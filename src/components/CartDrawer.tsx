'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Utensils,
  Clock,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface CartDrawerProps {
  restaurantSlug: string;
  restaurantName: string;
}

export function CartDrawer({ restaurantSlug, restaurantName }: CartDrawerProps) {
  const router = useRouter();
  const {
    items,
    tableContext,
    orderType,
    setOrderType,
    couponCode,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isCartOpen) return null;

  // Pricing calculations matching Screen 5
  const subtotal = items.reduce((sum, item) => {
    const addonsTotal = item.selectedAddons.reduce((s, a) => s + a.price, 0);
    return sum + (item.price + addonsTotal) * item.quantity;
  }, 0);

  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + taxes;

  const handlePlaceOrder = async () => {
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please provide your name and phone number to place the order.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        orderType: tableContext ? 'DINE_IN' : (orderType || 'DINE_IN'),
        tableId: tableContext?.tableId,
        tableSessionId: tableContext?.sessionToken,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        specialInstructions: orderNotes.trim() || undefined,
        couponCode: couponCode || undefined,
        items: items.map((i) => ({
          foodItemId: i.foodItemId,
          quantity: i.quantity,
          selectedAddonIds: i.selectedAddons.map((a) => a.id),
          specialInstructions: i.specialInstructions,
        })),
      };

      const res = await fetch(`/api/restaurant/${restaurantSlug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      // Success! Clear cart and route to live order status screen
      clearCart();
      setIsCartOpen(false);
      const cleanOrderNum = (data.orderNumber || '1001').replace('#', '');
      router.push(`/r/${restaurantSlug}/order/${cleanOrderNum}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#F8F9FA] rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-white border-b border-zinc-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <h2 className="font-display font-extrabold text-xl text-zinc-900">
              Your Cart
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
              {items.reduce((acc, i) => acc + i.quantity, 0)} items
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Layout matching Screen 5 */}
        <div className="overflow-y-auto p-5 sm:p-7 flex-1">
          {items.length === 0 ? (
            <div className="py-16 text-center text-zinc-500">
              <Utensils className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
              <p className="text-base font-bold text-zinc-800">Your cart is currently empty</p>
              <p className="text-xs text-zinc-500 mt-1">Explore our menu and add your favorite dishes.</p>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="mt-5 px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md hover:bg-red-700 transition-colors"
              >
                Explore Menu
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Items List & Notes (Screen 5) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* List of Cart Items */}
                <div className="space-y-3">
                  {items.map((item, idx) => {
                    const itemAddonsTotal = item.selectedAddons.reduce((s, a) => s + a.price, 0);
                    const itemTotal = (item.price + itemAddonsTotal) * item.quantity;

                    return (
                      <div
                        key={`${item.foodItemId}-${idx}`}
                        className="p-3.5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-between gap-4"
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 flex-shrink-0">
                          <img
                            src={item.imageUrl || '/images/pit-monster-burger.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Title & Price */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-bold text-sm text-zinc-900 truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs font-bold text-zinc-700 mt-0.5">
                            ₹ {item.price}
                          </p>
                          {item.selectedAddons.length > 0 && (
                            <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                              +{item.selectedAddons.map((a) => a.name).join(', ')}
                            </p>
                          )}
                        </div>

                        {/* Stepper matching Screen 5 */}
                        <div className="flex items-center rounded-lg bg-zinc-100 border border-zinc-200 px-1 py-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(idx, item.quantity - 1)}
                            className="p-1 rounded text-zinc-600 hover:text-zinc-900 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-zinc-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(idx, item.quantity + 1)}
                            className="p-1 rounded text-zinc-600 hover:text-zinc-900 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Red Trash Icon Button */}
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Add a note matching Screen 5 */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm space-y-2">
                  <label className="block text-xs font-bold text-zinc-800">
                    Add a note (optional)
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. less spicy, extra sauce..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Customer Details for Order */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm space-y-3">
                  <label className="block text-xs font-bold text-zinc-800">
                    Your Contact Details
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your Name *"
                      className="px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all"
                    />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Phone (+91 98765 43210) *"
                      className="px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

              </div>

              {/* Right Column: Order Summary (Screen 5) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Summary Card */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4">
                  <h3 className="font-display font-extrabold text-base text-zinc-900">
                    Order Summary
                  </h3>

                  <div className="space-y-2.5 text-xs text-zinc-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold text-zinc-900">₹ {subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes (5%)</span>
                      <span className="font-bold text-zinc-900">₹ {taxes}</span>
                    </div>
                    <div className="pt-2 border-t border-zinc-200 flex justify-between items-baseline">
                      <span className="font-bold text-sm text-zinc-900">Total</span>
                      <span className="font-display font-black text-xl text-zinc-900">
                        ₹ {total}
                      </span>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                      {errorMessage}
                    </div>
                  )}

                  {/* Proceed to Order Button */}
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Placing Order...</span>
                    ) : (
                      <>
                        <span>Proceed to Order</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Dine-in & Help Information matching Screen 5 */}
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-zinc-200 text-left">
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Utensils className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">
                        Dine-in at The Pit Cafe
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Pay at counter after your meal.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-zinc-200 text-left">
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">
                        Table number will be assigned
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        You&apos;ll get a confirmation with table details.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-zinc-200 text-left">
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HelpCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">
                        Need help?
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Call or WhatsApp us: +91 98765 43210
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
