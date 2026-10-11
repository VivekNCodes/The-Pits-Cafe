'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Utensils,
  Receipt,
  ArrowLeft,
  XCircle,
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface OrderData {
  id: string;
  orderNumber: string;
  orderType: string;
  customerName: string;
  customerPhone: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  discountName?: string | null;
  couponCode?: string | null;
  taxAmount: number;
  serviceCharge: number;
  totalAmount: number;
  paymentStatus: string;
  specialInstructions?: string | null;
  estimatedMinutes: number;
  pickupTime?: string | null;
  createdAt: string;
  table?: {
    tableNumber: string;
    location: string;
  } | null;
  orderItems: Array<{
    id: string;
    nameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
    customizations?: string | null;
    specialInstructions?: string | null;
    subtotal: number;
  }>;
}

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantSlug = params.slug as string;
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const { addItem, setIsCartOpen } = useCart();

  // Fetch order details
  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/restaurant/${restaurantSlug}/orders/${orderNumber}`);
      if (!res.ok) throw new Error('Order not found');
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Setup real-time updates via Server-Sent Events (SSE)
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/restaurant/${restaurantSlug}/events?orderId=${orderNumber}`);
      eventSource.addEventListener('orderUpdate', (e) => {
        try {
          const updated = JSON.parse(e.data);
          setOrder(updated);
        } catch {}
      });
    } catch {
      // Fallback: poll every 5 seconds
      const interval = setInterval(fetchOrder, 5000);
      return () => clearInterval(interval);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [restaurantSlug, orderNumber]);

  const handleCustomerCancel = async () => {
    if (!order || order.status !== 'PENDING') return;

    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch(
        `/api/restaurant/${restaurantSlug}/orders/${order.id}?reason=Cancelled+by+guest`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cancellation failed');
      setOrder((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
    } catch (err: any) {
      setCancelError(err.message || 'Unable to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const handleOrderAgain = async () => {
    if (!order) return;
    // Add available items to cart
    for (const item of order.orderItems) {
      addItem({
        foodItemId: item.id,
        name: item.nameSnapshot,
        price: item.priceSnapshot,
        isVeg: true,
        quantity: item.quantity,
        selectedAddons: [],
      });
    }
    setIsCartOpen(true);
    router.push(`/r/${restaurantSlug}#menu`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkSurface-bg flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-zinc-400">Loading your digital order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-darkSurface-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl bg-darkSurface-card border border-zinc-800 space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-white">Order Not Found</h2>
          <p className="text-xs text-zinc-400">
            {error || `We couldn't locate order #${orderNumber}. Please verify the number.`}
          </p>
          <Link
            href={`/r/${restaurantSlug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-white hover:bg-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Visual status step mapping
  const steps = [
    { key: 'PENDING', label: 'Order Placed', desc: 'Sent to restaurant' },
    { key: 'ACCEPTED', label: 'Accepted', desc: 'Approved by staff' },
    { key: 'PREPARING', label: 'Preparing', desc: 'Fresh in the kitchen' },
    { key: 'READY', label: 'Ready', desc: order.orderType === 'DINE_IN' ? 'Serving to table' : 'Ready for pickup' },
    { key: 'COMPLETED', label: 'Completed', desc: 'Dining complete' },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-darkSurface-bg py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href={`/r/${restaurantSlug}`}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Restaurant
          </Link>

          <span className="text-xs font-mono text-zinc-500">
            Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Order Header Card */}
        <div className="p-6 rounded-3xl bg-darkSurface-card border border-darkSurface-border shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-2xl text-white">
                  Order {order.orderNumber}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isCancelled
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : order.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-brand-500/20 text-brand-400 border border-brand-500/30 animate-pulse'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Guest: <strong className="text-zinc-200">{order.customerName}</strong> ({order.customerPhone})
              </p>
            </div>

            {/* Context Badge */}
            <div className="text-right">
              {order.orderType === 'DINE_IN' ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
                  <Utensils className="w-3.5 h-3.5 text-brand-400" />
                  <span>Dine-in: <strong>{order.table?.tableNumber || 'Assigned Table'}</strong></span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
                  <Clock className="w-3.5 h-3.5 text-amberGold" />
                  <span>Takeaway ({order.pickupTime || 'Pickup Soon'})</span>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation Notice if Cancelled */}
          {isCancelled ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-300 text-xs">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span>This order has been cancelled. If you have questions, please speak directly to restaurant staff.</span>
            </div>
          ) : (
            /* Live Progress Timeline */
            <div className="pt-3 pb-1">
              <div className="grid grid-cols-5 gap-2">
                {steps.map((step, idx) => {
                  const isDone = currentStepIdx >= idx;
                  const isCurrent = currentStepIdx === idx;

                  return (
                    <div key={step.key} className="text-center space-y-1.5">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isDone ? 'bg-gradient-to-r from-brand-600 to-amberGold shadow-glow' : 'bg-zinc-800'
                        }`}
                      />
                      <p
                        className={`text-[11px] font-semibold truncate ${
                          isCurrent ? 'text-brand-400' : isDone ? 'text-zinc-200' : 'text-zinc-600'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-400" />
                  Estimated Time: <strong className="text-white">~{order.estimatedMinutes} mins</strong>
                </span>

                {/* Cancel Action (Only eligible when Pending) */}
                {order.status === 'PENDING' ? (
                  <button
                    onClick={handleCustomerCancel}
                    disabled={cancelling}
                    className="text-rose-400 hover:text-rose-300 font-medium text-xs underline transition-colors"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                ) : (
                  <span className="text-[11px] text-zinc-500">
                    Cooking started • Contact staff for changes
                  </span>
                )}
              </div>
              {cancelError && (
                <p className="text-xs text-rose-400 mt-2 text-right">{cancelError}</p>
              )}
            </div>
          )}
        </div>

        {/* Digital Bill Card (Section 29) */}
        <div className="p-6 rounded-3xl bg-darkSurface-card border border-darkSurface-border shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-400" />
              Digital Bill Snapshot
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                order.paymentStatus === 'PAID_AT_COUNTER'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amberGold/15 text-amberGold border border-amberGold/30'
              }`}
            >
              {order.paymentStatus === 'PAID_AT_COUNTER' ? 'PAID AT COUNTER ✓' : 'PAY AT COUNTER'}
            </span>
          </div>

          {/* Items breakdown with snapshots */}
          <div className="space-y-3 divide-y divide-zinc-800/50">
            {order.orderItems.map((item) => {
              let parsedAddons: Array<{ name: string; price: number }> = [];
              if (item.customizations) {
                try {
                  parsedAddons = JSON.parse(item.customizations);
                } catch {}
              }

              return (
                <div key={item.id} className="pt-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-medium text-zinc-100">
                      {item.nameSnapshot} <span className="text-zinc-500">×{item.quantity}</span>
                    </p>
                    {parsedAddons.length > 0 && (
                      <p className="text-[10px] text-brand-400">
                        {parsedAddons.map((a) => `+${a.name}`).join(', ')}
                      </p>
                    )}
                    {item.specialInstructions && (
                      <p className="text-[10px] text-zinc-500 italic">
                        "{item.specialInstructions}"
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-zinc-200 font-semibold">
                    ₹{item.subtotal}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Totals Breakdown */}
          <div className="pt-4 border-t border-zinc-800 space-y-1.5 text-xs text-zinc-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-zinc-200">₹{order.subtotal}</span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>
                  {order.discountName || 'Promotional Discount'}
                  {order.couponCode ? ` (${order.couponCode})` : ''}
                </span>
                <span>-₹{order.discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>GST Tax</span>
              <span className="text-zinc-200">₹{order.taxAmount}</span>
            </div>

            {order.serviceCharge > 0 && (
              <div className="flex justify-between">
                <span>Service Charge</span>
                <span className="text-zinc-200">₹{order.serviceCharge}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-zinc-800">
              <span>Total Payable</span>
              <span className="text-brand-400">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Counter settlement instruction */}
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-start gap-2.5 text-[11px] text-zinc-400 mt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p>
              Please present this order number (<strong>{order.orderNumber}</strong>) at the restaurant billing counter when settling your payment.
            </p>
          </div>
        </div>

        {/* Quick Order Again Action */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={fetchOrder}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Status
          </button>

          <button
            onClick={handleOrderAgain}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs border border-zinc-800 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-brand-400" />
            Order Again
          </button>
        </div>
      </div>
    </div>
  );
}
