'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Utensils,
  MapPin,
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
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('19:30');
  const [guests, setGuests] = useState(4);

  // Available tables state from server engine
  const [availableTables, setAvailableTables] = useState<TableOption[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [isCheckingTables, setIsCheckingTables] = useState(false);

  // Guest details form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');

  // Booking result state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Fetch restaurant info
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

  // 2. Query available tables whenever Date, Time, or Guests change
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
          setAvailableTables(data.availableTables || []);
          if (data.availableTables && data.availableTables.length > 0) {
            setSelectedTableId(data.availableTables[0].id);
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

    if (!selectedTableId) {
      setErrorMessage('Please select an available table.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/restaurant/${restaurantSlug}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: selectedTableId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          guestCount: guests,
          reservationDate: date,
          startTime: time,
          specialRequest: specialRequest.trim() || undefined,
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
    <div className="min-h-screen flex flex-col bg-darkSurface-bg">
      {restaurant && <Header restaurant={restaurant} />}

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        {confirmedBooking ? (
          /* Confirmation Screen */
          <div className="max-w-lg mx-auto p-6 sm:p-8 rounded-3xl bg-darkSurface-card border border-darkSurface-border shadow-2xl text-center space-y-6 animate-slide-up">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-emerald-400">
                Reservation Confirmed
              </span>
              <h1 className="font-display font-extrabold text-2xl text-white mt-1">
                We'll See You Soon, {confirmedBooking.customerName}!
              </h1>
            </div>

            {/* Reservation Summary */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left space-y-2.5 text-xs text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Restaurant:</span>
                <span className="font-semibold text-white">{restaurant?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Date & Slot:</span>
                <span className="font-semibold text-white">
                  {confirmedBooking.reservationDate} at {confirmedBooking.startTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Assigned Table:</span>
                <span className="font-semibold text-brand-400">
                  {confirmedBooking.table?.tableNumber} ({confirmedBooking.table?.location})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Guest Count:</span>
                <span className="font-semibold text-white">{confirmedBooking.guestCount} Guests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status:</span>
                <span className="font-bold text-emerald-400">CONFIRMED</span>
              </div>
            </div>

            {/* QR Connection Instruction (Section 33) */}
            <div className="p-4 rounded-2xl bg-amberGold/10 border border-amberGold/30 text-left flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amberGold flex-shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-300 leading-relaxed">
                <strong>Arrival Tip:</strong> When you arrive at {confirmedBooking.table?.tableNumber}, simply scan the table's QR code. The system will recognize your booking and activate your dine-in ordering session!
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href={`/r/${restaurantSlug}`}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors"
              >
                Back to Restaurant
              </Link>
              <Link
                href={`/r/${restaurantSlug}#menu`}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-xs shadow-glow transition-transform hover:scale-105"
              >
                Browse Menu
              </Link>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-brand-400">
                Guaranteed Seating
              </span>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
                Reserve Your Table
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                Select your preferred date, time, and table location. Our server engine verifies availability in real time.
              </p>
            </div>

            <form
              onSubmit={handleBookingSubmit}
              className="p-6 sm:p-8 rounded-3xl bg-darkSurface-card border border-darkSurface-border shadow-2xl space-y-6"
            >
              {/* Step 1: Date, Time & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-brand-400" />
                    Date
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    Time Slot
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="12:00">12:00 PM (Lunch)</option>
                    <option value="13:00">1:00 PM (Lunch)</option>
                    <option value="14:00">2:00 PM (Lunch)</option>
                    <option value="17:00">5:00 PM (High Tea)</option>
                    <option value="18:30">6:30 PM (Evening)</option>
                    <option value="19:30">7:30 PM (Dinner)</option>
                    <option value="20:30">8:30 PM (Dinner)</option>
                    <option value="21:30">9:30 PM (Late Dinner)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-brand-400" />
                    Number of Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={4}>4 Guests</option>
                    <option value={6}>6 Guests</option>
                    <option value={8}>8+ Group Dining</option>
                  </select>
                </div>
              </div>

              {/* Step 2: Available Tables Section (Section 30, 32, 50) */}
              <div className="pt-4 border-t border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Available Tables ({availableTables.length})
                  </span>
                  {isCheckingTables && (
                    <span className="text-[11px] text-brand-400 animate-pulse">
                      Checking availability...
                    </span>
                  )}
                </div>

                {availableTables.length === 0 ? (
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center text-xs text-zinc-400">
                    No tables available for {guests} guests at {time} on this date. Please try a different slot.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableTables.map((t) => (
                      <label
                        key={t.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedTableId === t.id
                            ? 'bg-brand-500/10 border-brand-500 text-white shadow-sm'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tableOption"
                          value={t.id}
                          checked={selectedTableId === t.id}
                          onChange={() => setSelectedTableId(t.id)}
                          className="mt-1 text-brand-500 focus:ring-brand-500"
                        />
                        <div>
                          <p className="font-bold text-xs text-zinc-100">
                            {t.tableNumber}
                          </p>
                          <p className="text-[11px] text-zinc-400">{t.location}</p>
                          <p className="text-[10px] text-brand-400 mt-1">
                            Fits up to {t.capacity} guests
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 3: Guest Information */}
              <div className="pt-4 border-t border-zinc-800/80 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                  Guest Contact Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number (e.g. +91 98765 43210)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address (Optional, for confirmation note)"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                />
                <input
                  type="text"
                  placeholder="Special requests (e.g. high chair, anniversary celebration, quieter corner)"
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || availableTables.length === 0}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-amberGold text-white font-semibold text-sm shadow-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Confirming Table...</span>
                  ) : (
                    <span>Confirm Table Reservation</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {restaurant && <Footer restaurant={restaurant} />}
    </div>
  );
}
