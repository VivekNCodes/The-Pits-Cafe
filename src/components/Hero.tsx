'use client';

import React from 'react';
import Link from 'next/link';
import {
  Utensils,
  Calendar,
  MapPin,
  Clock,
  QrCode,
  Users,
  ArrowRight,
  Bike,
  ExternalLink,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface HeroProps {
  restaurant: {
    slug: string;
    name: string;
    heroHeading?: string | null;
    heroSubtitle?: string | null;
    heroImageUrl?: string | null;
    openingHours?: string | null;
    address: string;
    city: string;
    phone: string;
    googleMapsUrl?: string | null;
  };
}

export function Hero({ restaurant }: HeroProps) {
  const { tableContext } = useCart();

  return (
    <section className="relative overflow-hidden bg-[#0D0E12] text-white pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-zinc-800/80">
      {/* Ambient background glow accents */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[300px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-red-700/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Grid: Left copy, Right cafe photo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Heading, Subtext, CTAs, Avatars */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Small uppercase tag */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">
                FOOD &nbsp;•&nbsp; BIKES &nbsp;•&nbsp; GOOD TIMES
              </span>
            </div>

            {/* Main Title matching Screen 1 */}
            <div className="space-y-1">
              <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05] uppercase">
                <span className="block text-white">GOOD FOOD</span>
                <span className="block text-red-600">BETTER ROADS</span>
              </h1>
            </div>

            {/* Subtitle matching Screen 1 */}
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-lg">
              A cafe for riders, dreamers and food lovers. Great food, great company and a vibe that keeps you coming back.
            </p>

            {/* Quick Seated Table Banner if QR code was scanned */}
            {tableContext && (
              <div className="p-3.5 rounded-xl bg-red-600/15 border border-red-500/30 backdrop-blur-md flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    Table Session: {tableContext.tableNumber}
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </p>
                  <p className="text-[11px] text-zinc-300">
                    Your orders will be brought straight to this table!
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons matching Screen 1 */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
              <Link
                href="#menu"
                className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 hover:shadow-red-600/50 active:scale-95 transition-all flex items-center gap-2 group"
              >
                <Utensils className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Explore Menu</span>
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href={`/r/${restaurant.slug}/reservation`}
                className="px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 font-semibold text-sm border border-zinc-700/80 hover:border-zinc-500 transition-all flex items-center gap-2 active:scale-95"
              >
                <Calendar className="w-4 h-4 text-red-500" />
                <span>Reserve a Table</span>
              </Link>
            </div>

            {/* Social Proof: 3 overlapping avatars + 500+ Happy Customers */}
            <div className="pt-2 flex items-center gap-3.5">
              <div className="flex -space-x-2.5 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Customer"
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-[#0D0E12] object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Customer"
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-[#0D0E12] object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                  alt="Customer"
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-[#0D0E12] object-cover"
                />
              </div>
              <div className="text-left">
                <span className="block text-sm font-bold text-white tracking-wide leading-none">
                  500+
                </span>
                <span className="text-xs text-zinc-400 leading-none">
                  Happy Customers
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Illuminated Cafe Photo */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950 group">
              <img
                src={restaurant.heroImageUrl || '/images/pit-cafe-front-view.jpg'}
                alt="The Pit Cafe Night Front Rohini"
                className="w-full h-[320px] sm:h-[400px] lg:h-[440px] object-cover object-center transform group-hover:scale-102 transition-transform duration-700"
              />
              {/* Subtle gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Bottom Floating Stats Bar (Screen 1 bottom) */}
        <div className="mt-10 sm:mt-12 rounded-2xl bg-[#16181F]/90 backdrop-blur-md border border-zinc-800 p-4 sm:p-5 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-zinc-800/80">
            
            {/* Stat 1: Open Daily */}
            <div className="flex items-center gap-3.5 pt-2 md:pt-0">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/80 text-red-500 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                  Open Daily
                </p>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                  10 AM – 5 AM
                </p>
              </div>
            </div>

            {/* Stat 2: Rohini, Delhi */}
            <div className="flex items-center gap-3.5 pt-3 md:pt-0 md:pl-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/80 text-red-500 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                  Rohini, Delhi
                </p>
                <a
                  href={restaurant.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(restaurant.address + ' ' + restaurant.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] sm:text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1 mt-0.5 transition-colors"
                >
                  <span>View on Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Stat 3: 500+ Customers */}
            <div className="flex items-center gap-3.5 pt-3 md:pt-0 md:pl-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/80 text-red-500 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                  500+
                </p>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                  Happy Customers
                </p>
              </div>
            </div>

            {/* Stat 4: A Cafe for Riders */}
            <div className="flex items-center gap-3.5 pt-3 md:pt-0 md:pl-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/80 text-red-500 flex items-center justify-center flex-shrink-0">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                  A Cafe for Riders
                </p>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                  Food • Bikes • Good Times
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
