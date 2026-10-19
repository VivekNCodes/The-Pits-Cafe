'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Utensils, Calendar, Clock, Menu as MenuIcon, X, Phone } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { PitCafeLogo } from './PitCafeLogo';

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
    <header className="sticky top-0 z-40 w-full bg-[#0d0e12]/95 backdrop-blur-xl border-b border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand & Logo */}
        <PitCafeLogo href="/" />

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] font-semibold tracking-wide text-zinc-300">
          <Link
            href="/"
            className="hover:text-red-500 transition-colors"
          >
            Home
          </Link>
          <Link
            href="#menu"
            className="hover:text-red-500 transition-colors"
          >
            Menu
          </Link>
          <Link
            href={`/r/${restaurant.slug}/reservation`}
            className="hover:text-red-500 transition-colors"
          >
            Reservations
          </Link>
          <Link
            href="#story"
            className="hover:text-red-500 transition-colors"
          >
            Our Story
          </Link>
          <Link
            href="#gallery"
            className="hover:text-red-500 transition-colors"
          >
            Gallery
          </Link>
          <Link
            href="#contact"
            className="hover:text-red-500 transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Right Action Items: Status Pill + Order Now Button */}
        <div className="flex items-center gap-3">
          {/* Status Pill: "Open Now 10 AM - 5 AM" */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/60 text-xs font-medium text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-100 font-semibold">Open Now</span>
            <span className="text-zinc-500 text-[11px]">10 AM - 5 AM</span>
          </div>

          {/* Table QR Active Badge */}
          {tableContext && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Table {tableContext.tableNumber}
            </span>
          )}

          {/* Primary CTA: Order Now (Red Pill Button) */}
          <button
            onClick={() => {
              if (totalQuantity > 0) {
                setIsCartOpen(true);
              } else {
                const el = document.getElementById('menu');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setIsCartOpen(true);
                }
              }
            }}
            className="relative flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/30 hover:shadow-red-600/50 active:scale-95 transition-all"
            aria-label="Order food"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Order Now</span>
            {totalQuantity > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-black/40 text-[11px] font-bold text-white ml-0.5">
                {totalQuantity}
              </span>
            )}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800/80 bg-zinc-950/98 backdrop-blur-2xl px-5 py-5 space-y-3 animate-slide-up shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-white">Open Now</span>
              <span className="text-zinc-500">10 AM - 5 AM</span>
            </div>
            {tableContext && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Table {tableContext.tableNumber}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-200 bg-zinc-900/60 hover:bg-zinc-800 flex items-center gap-2"
            >
              Home
            </Link>
            <Link
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-200 bg-zinc-900/60 hover:bg-zinc-800 flex items-center gap-2"
            >
              <Utensils className="w-3.5 h-3.5 text-red-500" />
              Menu
            </Link>
            <Link
              href={`/r/${restaurant.slug}/reservation`}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-200 bg-zinc-900/60 hover:bg-zinc-800 flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5 text-red-500" />
              Reservations
            </Link>
            <Link
              href="#story"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-200 bg-zinc-900/60 hover:bg-zinc-800 flex items-center gap-2"
            >
              Our Story
            </Link>
            <Link
              href="#gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-200 bg-zinc-900/60 hover:bg-zinc-800 flex items-center gap-2"
            >
              Gallery
            </Link>
            <Link
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-200 bg-zinc-900/60 hover:bg-zinc-800 flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-red-500" />
              Contact
            </Link>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsCartOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Cart & Checkout ({totalQuantity})</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
