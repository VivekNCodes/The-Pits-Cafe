'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle2,
  TreePine,
  Home,
  Sun,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface TableOption {
  id: string;
  tableNumber: string;
  slug: string;
  capacity: number;
  location: string;
}

export default function ReservationPage() {
  const params = useParams();
  const restaurantSlug = params.slug as string;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState(4);
  const [seatingArea, setSeatingArea] = useState<'Outdoor' | 'Indoor' | 'Rooftop'>('Outdoor');

  // Available tables state
  const [availableTables, setAvailableTables] = useState<TableOption[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [isCheckingTables, setIsCheckingTables] = useState(false);

  // Guest details form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');

  // Booking result
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Fetch restaurant
  useEffect(() => {
    async function loadRestaurant() {
      try {
        const res = await fetch(`/api/restaurant/${restaurantSlug}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurant(data);
        }
      } catch (e) {
        console.error('Failed to load restaurant', e);
      }
    }
    if (restaurantSlug) loadRestaurant();
  }, [restaurantSlug]);

  // 2. Query available tables
  useEffect(() => {
    async function checkAvailability() {
      setIsCheckingTables(true);
      setErrorMessage(null);
      try {
        const res = await fetch(
          `/api/restaurant/${restaurantSlug}/reservations?date=${date}&time=${time}&guests=${guests}`
        );
        if (res.ok) {
          const data = await res.json();
          const tablesList: TableOption[] = data.availableTables || [];
          setAvailableTables(tablesList);
          if (tablesList.length > 0) {
            setSelectedTableId(tablesList[0].id);
          } else {
            setSelectedTableId('');
          }
        }
      } catch (e) {
        console.error('Failed to check availability', e);
      } finally {
        setIsCheckingTables(false);
      }
    }

    if (restaurantSlug && date && time && guests) {
      checkAvailability();
    }
  }, [restaurantSlug, date, time, guests]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please enter your name and phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/restaurant/${restaurantSlug}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: selectedTableId || (availableTables[0]?.id),
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          guestCount: guests,
          reservationDate: date,
          startTime: time,
          specialRequest: `${seatingArea} seating preferred. ${specialRequest.trim()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete reservation.');
      }

      setConfirmedBooking(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try a different slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0E12] text-white">
      {restaurant && <Header restaurant={restaurant} />}

      <main className="flex-1 max-w-xl mx-auto px-4 py-10 sm:py-16 w-full">
        {confirmedBooking ? (
          /* Confirmation State */
          <div className="p-6 sm:p-8 rounded-3xl bg-[#16181F] border border-zinc-800 shadow-2xl text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-emerald-400">
                Reservation Confirmed
              </span>
              <h1 className="font-display font-extrabold text-2xl text-white mt-1">
                Spot Reserved for {confirmedBooking.customerName}!
              </h1>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D0E12] border border-zinc-800 text-left space-y-2.5 text-xs text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Date & Slot:</span>
                <span className="font-semibold text-white">
                  {confirmedBooking.reservationDate} at {confirmedBooking.startTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Seating Area:</span>
                <span className="font-semibold text-red-400">{seatingArea} Area</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Party Size:</span>
                <span className="font-semibold text-white">{confirmedBooking.guestCount} Guests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Table:</span>
                <span className="font-bold text-white">
                  {confirmedBooking.table?.tableNumber || 'Assigned on arrival'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-600/10 border border-red-500/30 text-left flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-300 leading-relaxed">
                <strong>Instant Confirmation Sent:</strong> Details have been logged. When you arrive, just mention your name or phone number at the counter!
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href={`/r/${restaurantSlug}`}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors"
              >
                Back to Home
              </Link>
              <Link
                href={`/r/${restaurantSlug}#menu`}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-lg transition-transform hover:scale-105"
              >
                Explore Menu
              </Link>
            </div>
          </div>
        ) : (
          /* Screen 3: RESERVE A TABLE Form Card */
          <div className="space-y-6">
            
            {/* Heading and Subtitle matching Screen 3 */}
            <div className="text-center space-y-2">
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wider uppercase">
                RESERVE A TABLE
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Good food tastes better together. Book your spot and enjoy the perfect pit stop.
              </p>
            </div>

            {/* Form Card */}
            <form
              onSubmit={handleBookingSubmit}
              className="p-6 sm:p-8 rounded-3xl bg-[#16181F] border border-zinc-800 shadow-2xl space-y-4"
            >
              {/* Row 1: Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={todayStr}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0E12] border border-zinc-700/80 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0E12] border border-zinc-700/80 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Guests Dropdown */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0E12] border border-zinc-700/80 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
                >
                  <option value={1}>1 Person</option>
                  <option value={2}>2 People</option>
                  <option value={3}>3 People</option>
                  <option value={4}>4 People</option>
                  <option value={6}>6 People</option>
                  <option value={8}>8 People</option>
                  <option value={10}>10+ People (Biker Group)</option>
                </select>
              </div>

              {/* Row 3: Seating Area Pills (Outdoor, Indoor, Rooftop) */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Seating Area
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSeatingArea('Outdoor')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      seatingArea === 'Outdoor'
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : 'bg-[#0D0E12] text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    <TreePine className="w-3.5 h-3.5" />
                    <span>Outdoor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSeatingArea('Indoor')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      seatingArea === 'Indoor'
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : 'bg-[#0D0E12] text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Indoor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSeatingArea('Rooftop')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      seatingArea === 'Rooftop'
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : 'bg-[#0D0E12] text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Rooftop</span>
                  </button>
                </div>
              </div>

              {/* Row 4: Name */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0E12] border border-zinc-700/80 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {/* Row 5: Phone Number */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0E12] border border-zinc-700/80 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {/* Row 6: Special Requests (Optional) */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Special Requests (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Birthday, special occasion..."
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0E12] border border-zinc-700/80 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-600/15 border border-red-500/40 text-red-400 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* Red Action Button matching Screen 3 */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Checking Availability...</span>
                  ) : (
                    <>
                      <span>Check Availability</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Bottom notification badge matching Screen 3 */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 text-red-500 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    Instant confirmation
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    You&apos;ll receive a confirmation on WhatsApp/SMS.
                  </p>
                </div>
              </div>

            </form>

          </div>
        )}
      </main>

      <Footer restaurant={restaurant} />
    </div>
  );
}
