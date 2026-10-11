'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Utensils, QrCode, AlertTriangle, ArrowRight, CheckCircle2, Sparkles, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function TableQRScanPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantSlug = params.slug as string;
  const tableSlug = params.tableSlug as string;

  const { setTableContext, setOrderType } = useCart();

  const [loading, setLoading] = useState(true);
  const [inactiveError, setInactiveError] = useState<string | null>(null);
  const [tableData, setTableData] = useState<{
    id: string;
    tableNumber: string;
    slug: string;
    capacity: number;
    location: string;
  } | null>(null);
  const [restaurantData, setRestaurantData] = useState<{
    name: string;
    welcomeGreetingHeading: string;
    welcomeGreetingMessage: string;
    qrCtaText: string;
    logoUrl?: string;
  } | null>(null);
  const [reservationNotice, setReservationNotice] = useState<{
    guestName: string;
    time: string;
  } | null>(null);

  useEffect(() => {
    async function initSession() {
      try {
        setLoading(true);
        // 1. Fetch restaurant info
        const resInfo = await fetch(`/api/restaurant/${restaurantSlug}`);
        if (!resInfo.ok) throw new Error('Restaurant not found');
        const restJson = await resInfo.json();
        setRestaurantData({
          name: restJson.name,
          welcomeGreetingHeading: restJson.welcomeGreetingHeading || `Welcome to ${restJson.name}`,
          welcomeGreetingMessage: restJson.welcomeGreetingMessage || 'You are seated and ready to order directly from your table.',
          qrCtaText: restJson.qrCtaText || 'View Menu & Order',
          logoUrl: restJson.logoUrl,
        });

        // 2. Start or restore table session
        const sessionRes = await fetch(`/api/restaurant/${restaurantSlug}/tables/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tableSlug }),
        });

        const sessionJson = await sessionRes.json();

        if (!sessionRes.ok) {
          if (sessionJson.inactive) {
            setInactiveError(sessionJson.error || 'This table QR is currently inactive. Please ask staff for assistance.');
            return;
          }
          throw new Error(sessionJson.error || 'Failed to initialize table session');
        }

        setTableData(sessionJson.table);

        if (sessionJson.reservation) {
          setReservationNotice({
            guestName: sessionJson.reservation.guestName,
            time: sessionJson.reservation.time,
          });
        }

        // Store into CartContext & LocalStorage
        setTableContext({
          tableId: sessionJson.table.id,
          tableNumber: sessionJson.table.tableNumber,
          tableSlug: sessionJson.table.slug,
          sessionToken: sessionJson.session?.sessionToken,
        });
        setOrderType('DINE_IN');
      } catch (err: any) {
        setInactiveError(err.message || 'Unable to load table information.');
      } finally {
        setLoading(false);
      }
    }

    if (restaurantSlug && tableSlug) {
      initSession();
    }
  }, [restaurantSlug, tableSlug]);

  const handleProceedToMenu = () => {
    router.push(`/r/${restaurantSlug}#menu`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkSurface-bg flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-zinc-300 font-medium">Connecting to table session...</p>
        <p className="text-xs text-zinc-500 mt-1">Please wait a moment</p>
      </div>
    );
  }

  // Inactive QR state (Section 9 & 80)
  if (inactiveError) {
    return (
      <div className="min-h-screen bg-darkSurface-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-darkSurface-card border border-rose-500/30 shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-white">
              Table QR Inactive
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              {inactiveError}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href={`/r/${restaurantSlug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
            >
              Browse General Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkSurface-bg flex flex-col items-center justify-center p-4 sm:p-6 text-center relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-darkSurface-card/95 border border-darkSurface-border shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Restaurant Logo / Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-amberGold p-[2px] mx-auto shadow-glow">
          <div className="w-full h-full rounded-[14px] bg-darkSurface-card flex items-center justify-center overflow-hidden">
            {restaurantData?.logoUrl ? (
              <img
                src={restaurantData.logoUrl}
                alt={restaurantData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Utensils className="w-8 h-8 text-brand-400" />
            )}
          </div>
        </div>

        {/* Table Seating Badge */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Seated at {tableData?.tableNumber} ({tableData?.location})
          </span>
        </div>

        {/* Greeting Message (Section 11) */}
        <div className="space-y-2">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            {restaurantData?.welcomeGreetingHeading || 'Welcome to The Pit Cafe'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
            {restaurantData?.welcomeGreetingMessage}
          </p>
        </div>

        {/* Section 33: Connected Reservation Notice if found */}
        {reservationNotice && (
          <div className="p-3.5 rounded-xl bg-amberGold/10 border border-amberGold/30 text-left flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-amberGold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amberGold">
                Active Reservation Recognized
              </p>
              <p className="text-[11px] text-zinc-400">
                Welcome, {reservationNotice.guestName} ({reservationNotice.time}). Your table session is ready!
              </p>
            </div>
          </div>
        )}

        {/* Main CTA: View Menu */}
        <div className="pt-2 space-y-3">
          <button
            onClick={handleProceedToMenu}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-amberGold text-white font-semibold text-sm shadow-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>{restaurantData?.qrCtaText || 'View Menu & Order'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-zinc-500">
            Payment is collected at the restaurant counter after your meal.
          </p>
        </div>
      </div>
    </div>
  );
}
