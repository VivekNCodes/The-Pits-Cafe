'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, Tag, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
    setCouponCode,
    billSummary,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    recalculateBill,
  } = useCart();

  const [couponInput, setCouponInput] = useState(couponCode || '');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('In 20 minutes');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [couponNotice, setCouponNotice] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponCode(couponInput.trim().toUpperCase());
    await recalculateBill(restaurantSlug);
    setCouponNotice(`Coupon "${couponInput.trim().toUpperCase()}" applied.`);
  };

  const handlePlaceOrder = async () => {
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please provide your name and phone number.');
      return;
    }

    if (orderType === 'DINE_IN' && !tableContext) {
      setErrorMessage('Dine-in requires scanning a table QR code. Please switch to Takeaway or scan a table QR.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        orderType,
        tableId: tableContext?.tableId,
        tableSessionId: tableContext?.sessionToken,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        pickupTime: orderType === 'TAKEAWAY' ? pickupTime : undefined,
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
      const cleanOrderNum = data.orderNumber.replace('#', '');
      router.push(`/r/${restaurantSlug}/order/${cleanOrderNum}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-md flex justify-end animate-fade-in">
      <div className="relative w-full max-w-md bg-darkSurface-card border-l border-darkSurface-border h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-lg text-white">Your Order</h2>
            {tableContext ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Table {tableContext.tableNumber}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amberGold/10 text-amberGold border border-amberGold/30">
                {orderType === 'DINE_IN' ? 'Dine In' : 'Takeaway'}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Mode Switcher (Dine In vs Takeaway) */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/40 flex-shrink-0">
          <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              type="button"
              onClick={() => setOrderType('DINE_IN')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                orderType === 'DINE_IN'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🍽️ Dine In {tableContext ? `(${tableContext.tableNumber})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setOrderType('TAKEAWAY')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                orderType === 'TAKEAWAY'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🥡 Takeaway
            </button>
          </div>
          {orderType === 'DINE_IN' && !tableContext && (
            <p className="text-[11px] text-amberGold mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Not seated via QR code yet. Scan table QR or staff will assign table.
            </p>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-3">
                <Tag className="w-7 h-7 text-zinc-600" />
              </div>
              <p className="text-sm font-medium text-zinc-300">Your cart is empty</p>
              <p className="text-xs text-zinc-500 mt-1">
                Explore the menu and add your favorite dishes to begin.
              </p>
            </div>
          ) : (
            items.map((item, idx) => {
              const addonsCost = item.selectedAddons.reduce((sum, a) => sum + a.price, 0);
              const lineTotal = (item.price + addonsCost) * item.quantity;

              return (
                <div
                  key={`${item.foodItemId}-${idx}`}
                  className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            item.isVeg ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        <h4 className="font-medium text-xs sm:text-sm text-zinc-100">
                          {item.name}
                        </h4>
                      </div>

                      {/* Addon details */}
                      {item.selectedAddons.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.selectedAddons.map((addon) => (
                            <span
                              key={addon.id}
                              className="text-[10px] text-brand-300 bg-brand-500/10 px-1.5 py-0.5 rounded"
                            >
                              +{addon.name} (₹{addon.price})
                            </span>
                          ))}
                        </div>
                      )}

                      {item.specialInstructions && (
                        <p className="text-[11px] text-zinc-500 italic mt-1">
                          Note: "{item.specialInstructions}"
                        </p>
                      )}
                    </div>

                    <span className="font-display font-semibold text-xs text-white">
                      ₹{lineTotal}
                    </span>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-zinc-500 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>

                    <div className="flex items-center gap-2 bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-800">
                      <button
                        onClick={() => updateQuantity(idx, item.quantity - 1)}
                        className="text-zinc-400 hover:text-white p-0.5"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold text-white w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(idx, item.quantity + 1)}
                        className="text-zinc-400 hover:text-white p-0.5"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Coupon Code Input */}
          {items.length > 0 && (
            <form onSubmit={handleApplyCoupon} className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Coupon (e.g. WELCOME100)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 uppercase font-mono focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                >
                  Apply
                </button>
              </div>
              {couponNotice && (
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {couponNotice}
                </p>
              )}
            </form>
          )}

          {/* Customer Contact Details */}
          {items.length > 0 && (
            <div className="pt-3 border-t border-zinc-800 space-y-2.5">
              <span className="text-xs font-semibold text-zinc-300 block">
                Contact & Verification
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              {orderType === 'TAKEAWAY' && (
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    Estimated Pickup Time
                  </label>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="In 15 minutes">In 15 minutes</option>
                    <option value="In 25 minutes">In 25 minutes</option>
                    <option value="In 40 minutes">In 40 minutes</option>
                    <option value="In 1 hour">In 1 hour</option>
                  </select>
                </div>
              )}

              <input
                type="text"
                placeholder="Kitchen notes (e.g. deliver altogether, extra napkins)"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          )}
        </div>

        {/* Bill Breakdown & Checkout Action */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950/80 space-y-3 flex-shrink-0">
            {/* Breakdown */}
            <div className="space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Item Subtotal</span>
                <span className="text-zinc-200">₹{billSummary.subtotal}</span>
              </div>

              {billSummary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>{billSummary.discountName || 'Restaurant Discount'}</span>
                  <span>-₹{billSummary.discountAmount}</span>
                </div>
              )}

              {billSummary.couponDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Coupon ({billSummary.couponCode})</span>
                  <span>-₹{billSummary.couponDiscountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>GST ({billSummary.taxPercentage}%)</span>
                <span className="text-zinc-200">₹{billSummary.taxAmount}</span>
              </div>

              {billSummary.serviceCharge > 0 && (
                <div className="flex justify-between">
                  <span>Service Charge</span>
                  <span className="text-zinc-200">₹{billSummary.serviceCharge}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                <span>Final Payable Amount</span>
                <span className="text-brand-400 text-base">
                  ₹{billSummary.totalAmount}
                </span>
              </div>
            </div>

            {/* Payment at Counter Notice (Section 29) */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>Counter Payment:</strong> Please settle your digital bill at the restaurant billing desk upon checkout.
              </span>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Submit Action */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-amberGold text-white font-semibold text-sm shadow-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Placing your order...</span>
              ) : (
                <>
                  <span>Place Order (Pay at Counter)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
