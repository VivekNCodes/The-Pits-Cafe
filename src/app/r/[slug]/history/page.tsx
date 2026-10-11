'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Clock, Utensils, Receipt, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/context/CartContext';

export default function OrderHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantSlug = params.slug as string;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addItem, setIsCartOpen } = useCart();

  React.useEffect(() => {
    async function loadRestaurant() {
      try {
        const res = await fetch(`/api/restaurant/${restaurantSlug}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurant(data);
        }
      } catch (e) {}
    }
    if (restaurantSlug) loadRestaurant();
  }, [restaurantSlug]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/restaurant/${restaurantSlug}/orders?phone=${encodeURIComponent(query.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        setHistoryOrders(data || []);
      }
    } catch (e) {
      console.error('History lookup failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAgain = (order: any) => {
    for (const item of order.orderItems) {
      addItem({
        foodItemId: item.foodItemId || item.id,
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

  return (
    <div className="min-h-screen flex flex-col bg-darkSurface-bg">
      {restaurant && <Header restaurant={restaurant} />}

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full space-y-8">
        <div className="text-center space-y-2 max-w-md mx-auto">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-400">
            Order Lookup & History
          </span>
          <h1 className="font-display font-extrabold text-3xl text-white">
            Find Your Orders
          </h1>
          <p className="text-xs text-zinc-400">
            Enter the phone number or email you used when placing your dine-in or takeaway order.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Enter Phone Number or Email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-darkSurface-card border border-darkSurface-border text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 shadow-md"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shadow-glow"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Results */}
        {searched && (
          <div className="space-y-4">
            {historyOrders.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-zinc-900/50 border border-zinc-800 text-zinc-400 text-xs">
                No orders found under "{query}". Please check the phone number entered.
              </div>
            ) : (
              historyOrders.map((order) => {
                const cleanNum = order.orderNumber.replace('#', '');
                return (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-darkSurface-card border border-darkSurface-border shadow-md space-y-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-base text-white">
                            {order.orderNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-brand-300">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString([], {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          • {order.orderType === 'DINE_IN' ? `Table ${order.table?.tableNumber || ''}` : 'Takeaway'}
                        </p>
                      </div>

                      <span className="font-display font-extrabold text-base text-white">
                        ₹{order.totalAmount}
                      </span>
                    </div>

                    {/* Item snippets */}
                    <div className="text-xs text-zinc-400 divide-y divide-zinc-800/40">
                      {order.orderItems?.map((oi: any) => (
                        <div key={oi.id} className="py-1 flex justify-between">
                          <span>
                            {oi.nameSnapshot} ×{oi.quantity}
                          </span>
                          <span>₹{oi.subtotal}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                      <Link
                        href={`/r/${restaurantSlug}/order/${cleanNum}`}
                        className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        View Live Status & Digital Bill
                      </Link>

                      <button
                        onClick={() => handleOrderAgain(order)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-brand-400" />
                        Order Again
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {restaurant && <Footer restaurant={restaurant} />}
    </div>
  );
}
