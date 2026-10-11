'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Utensils, Calendar, Clock, Menu as MenuIcon, X, Phone, Flame } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface HeaderProps {
  restaurant: {
    slug: string;
    name: string;
    tagline?: string | null;
    logoUrl?: string | null;
    phone?: string | null;
  };
}

export function Header({ restaurant }: HeaderProps) {
  const { items, tableContext, setIsCartOpen, billSummary } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c0d10]/90 backdrop-blur-xl border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand & Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-[2px] shadow-lg shadow-orange-500/20 flex-shrink-0 transition-transform group-hover:scale-105">
            <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center overflow-hidden">
              {restaurant.logoUrl ? (
                <img
                  src={restaurant.logoUrl}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Flame className="w-5 h-5 text-amber-400" />
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors uppercase">
                {restaurant.name}
              </span>
              {/* Dynamic Seated Table Badge if QR Session is Active */}
              {tableContext && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Table {tableContext.tableNumber}
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block truncate max-w-[280px]">
              Sector 16, Rohini · Open till 5:00 AM
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <Link
            href="#menu"
            className="text-zinc-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <Utensils className="w-4 h-4" />
            <span>Digital Menu</span>
          </Link>
          <Link
            href="#story"
            className="text-zinc-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <span>Our Story</span>
          </Link>
          <Link
            href={`/r/${restaurant.slug}/reservation`}
            className="text-zinc-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Table</span>
          </Link>
          <Link
            href={`/r/${restaurant.slug}/history`}
            className="text-zinc-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4" />
            <span>Track Order</span>
          </Link>
        </nav>

        {/* Actions: Table Badge (Mobile) + Direct Phone + Cart Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {tableContext && (
            <span className="sm:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {tableContext.tableNumber}
            </span>
          )}

          {/* Quick Call Button */}
          <a
            href="tel:+919717780445"
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-amber-500/50 transition-colors"
            title="Call Cafe"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>+91 97177 80445</span>
          </a>

          {/* Trigger Cart Drawer */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">
              {totalQuantity > 0 ? `₹${billSummary.totalAmount}` : 'Cart'}
            </span>
            {totalQuantity > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-black/40 text-[11px] font-bold">
                {totalQuantity}
              </span>
            )}
          </button>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800/80 bg-zinc-950/98 backdrop-blur-xl px-4 py-4 space-y-3 animate-slide-up">
          <Link
            href={`/r/${restaurant.slug}#menu`}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:bg-zinc-900"
          >
            <Utensils className="w-4 h-4 text-amber-400" />
            Digital Menu
          </Link>
          <Link
            href={`/r/${restaurant.slug}/reservation`}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:bg-zinc-900"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            Book a Courtyard Table
          </Link>
          <Link
            href={`/r/${restaurant.slug}/history`}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:bg-zinc-900"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            Order Status & History
          </Link>
          <a
            href="tel:+919717780445"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
          >
            <Phone className="w-4 h-4" />
            Call: +91 97177 80445
          </a>
        </div>
      )}
    </header>
  );
}
