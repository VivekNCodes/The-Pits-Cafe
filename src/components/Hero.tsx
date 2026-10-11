'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Utensils,
  Calendar,
  MapPin,
  Clock,
  QrCode,
  Sparkles,
  Plus,
  Star,
  Flame,
  Check,
  Coffee,
  Phone,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  Compass,
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

interface SpotlightDish {
  id: string;
  name: string;
  price: number;
  prepTime: number;
  category: string;
  imageUrl: string;
  badge: string;
  isVeg: boolean;
  isSpicy?: boolean;
  rating: number;
  description: string;
}

const SPOTLIGHT_DISHES: SpotlightDish[] = [
  {
    id: 'pull-apart-cheesy-garlic-bread',
    name: 'Pull-Apart Cheesy Garlic Bread',
    price: 180,
    prepTime: 12,
    category: 'Viral Starters',
    imageUrl: '/images/pull-apart-garlic-bread.jpg',
    badge: 'Artisanal Bestseller',
    isVeg: true,
    isSpicy: false,
    rating: 4.9,
    description: 'Sourdough loaf drenched in herb garlic butter, stuffed with overflowing molten mozzarella cheese pull.',
  },
  {
    id: 'the-pit-monster-biker-burger',
    name: 'The Pit Monster Biker Burger',
    price: 220,
    prepTime: 18,
    category: 'Burgers',
    imageUrl: '/images/pit-monster-burger.jpg',
    badge: 'Chef Signature',
    isVeg: true,
    isSpicy: true,
    rating: 5.0,
    description: 'Double crunchy spiced patties, double molten cheddar, caramelized onions, jalapeños, and smoky chipotle mayo.',
  },
  {
    id: 'kurkuri-soya-chaap-sticks',
    name: 'Kurkuri Soya Chaap Sticks',
    price: 160,
    prepTime: 15,
    category: 'Tandoori Bites',
    imageUrl: '/images/kurkuri-chaap.jpg',
    badge: 'Cult Favorite',
    isVeg: true,
    isSpicy: false,
    rating: 4.9,
    description: 'Crunchy golden battered soya chaap sticks dusted with chaat masala, served with laccha onions & mint dip.',
  },
  {
    id: 'signature-kurkure-momos',
    name: 'Signature Kurkure Momos',
    price: 140,
    prepTime: 12,
    category: 'Momos Junction',
    imageUrl: '/images/kurkure-momos.jpg',
    badge: 'Street Crunch',
    isVeg: true,
    isSpicy: true,
    rating: 4.9,
    description: 'Crumb-crusted deep fried momos served with fiery red chili garlic chutney and seasoned creamy mayonnaise.',
  },
  {
    id: 'peri-peri-tossed-maggi',
    name: 'Peri Peri Tossed Maggi',
    price: 130,
    prepTime: 10,
    category: 'Midnight Bowls',
    imageUrl: '/images/peri-peri-maggi.jpg',
    badge: 'Midnight Special',
    isVeg: true,
    isSpicy: true,
    rating: 4.8,
    description: 'Two cakes of Maggi tossed in fiery peri-peri spices, sweet corn, bell peppers, and melted table butter.',
  },
  {
    id: 'belgian-dark-chocolate-thick-shake',
    name: 'Belgian Dark Chocolate Shake',
    price: 170,
    prepTime: 8,
    category: 'Thick Shakes',
    imageUrl: '/images/belgian-chocolate-shake.jpg',
    badge: 'Barista Blend',
    isVeg: true,
    isSpicy: false,
    rating: 4.9,
    description: 'Dense Belgian chocolate blended with whole milk and ice cream, topped with whipped cream & dark fudge drizzle.',
  },
];

export function Hero({ restaurant }: HeroProps) {
  const { tableContext, setOrderType, setIsCartOpen, addItem } = useCart();
  const [selectedDishIndex, setSelectedDishIndex] = useState(0);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const activeDish = SPOTLIGHT_DISHES[selectedDishIndex];

  const handleTakeawayClick = () => {
    setOrderType('TAKEAWAY');
    setIsCartOpen(true);
  };

  const handleQuickAddDish = (dish: SpotlightDish) => {
    addItem({
      foodItemId: dish.id,
      name: dish.name,
      price: dish.price,
      imageUrl: dish.imageUrl,
      isVeg: dish.isVeg,
      quantity: 1,
      selectedAddons: [],
    });
    setAddedNotice(dish.name);
    setTimeout(() => setAddedNotice(null), 2200);
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-16 sm:pb-24 border-b border-zinc-800/80 bg-gradient-to-b from-[#0e1013] via-[#121418] to-[#0e1013]">
      {/* Warm atmospheric ambient light accents */}
      <div className="absolute top-12 left-1/4 -translate-x-1/2 w-[650px] h-[400px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Heading, Value Proposition & Actions */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Status & Trust Badges */}
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Open Late Night · Till 5:00 AM</span>
              </span>

              <a
                href={restaurant.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(restaurant.address + ' ' + restaurant.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800 hover:border-amber-500/50 backdrop-blur-md transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Sector 16, Rohini</span>
              </a>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>4.6★ on Google (500+ Reviews)</span>
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.08]">
                Rohini’s Legendary <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">Biker Courtyard</span> & Midnight Bites.
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Pull into our open-air courtyard under warm fairy lights. Savor our viral Pull-Apart Cheesy Garlic Bread, crunchy Kurkuri Chaap, fiery Peri Peri Maggi, and monster burgers. Freshly cooked till <span className="text-amber-400 font-semibold">5:00 AM</span>.
              </p>
            </div>

            {/* Quick Seated Table Banner (if user scanned a QR code) */}
            {tableContext && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-md flex items-center gap-3.5 text-left shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    Active Table Session: {tableContext.tableNumber}
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </p>
                  <p className="text-[11px] text-zinc-300">
                    Dishes you add will be delivered straight to your table! Pay at counter when finished.
                  </p>
                </div>
              </div>
            )}

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1">
              <Link
                href="#menu"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 group"
              >
                <Utensils className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Explore Full Menu</span>
              </Link>

              <Link
                href={`/r/${restaurant.slug}/reservation`}
                className="px-5 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold text-sm border border-zinc-800 hover:border-amber-500/50 transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Reserve Courtyard Table</span>
              </Link>

              <a
                href={`tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`}
                className="px-4 py-3.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/90 text-zinc-300 hover:text-white font-medium text-sm border border-zinc-800/80 transition-all flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call Cafe: {restaurant.phone}</span>
              </a>
            </div>

            {/* Key Value Badges */}
            <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-3 gap-2.5 text-left">
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Biker Courtyard</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Bike Parking & Outdoor Seating</p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Open till 5 AM</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Midnight Food Refuel Hub</p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-orange-400 text-xs font-bold">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Table Order</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Zero Wait & Counter Payment</p>
              </div>
            </div>
          </div>

          {/* Right Column: High-Impact Courtyard Showcase & Interactive Dish Selector */}
          <div className="lg:col-span-6 flex flex-col items-center">
            
            {/* Main Courtyard Visual Card */}
            <div className="w-full relative group">
              <div className="relative rounded-3xl overflow-hidden border border-zinc-800/90 shadow-2xl bg-zinc-950">
                
                {/* Hero Atmosphere Image */}
                <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                  <img
                    src="/images/pit-cafe-courtyard.jpg"
                    alt="The Pit Cafe Biker Courtyard Rohini"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                  
                  {/* Floating Tag: Authentic Cafe Courtyard */}
                  <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-zinc-950/85 backdrop-blur-md border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center gap-2 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>The Pit Cafe · Sector 16 Rohini</span>
                  </div>

                  {/* Floating Tag: Counter Pay */}
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 shadow-lg">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pay at Counter</span>
                  </div>
                </div>

                {/* Interactive Spotlight Dish Section Pinned Below Hero Image */}
                <div className="p-4 sm:p-5 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800/80 relative">
                  
                  {/* Dish Selector Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/60">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        Signature Pitstop Bestseller
                      </span>
                    </div>

                    {/* Quick navigation dots */}
                    <div className="flex items-center gap-1.5">
                      {SPOTLIGHT_DISHES.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedDishIndex(idx)}
                          className={`h-2 rounded-full transition-all ${
                            selectedDishIndex === idx
                              ? 'w-6 bg-amber-500'
                              : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                          }`}
                          aria-label={`Select dish ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Active Dish Detail */}
                  <div className="flex items-center gap-4">
                    {/* Dish Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-amber-500/40 shadow-lg flex-shrink-0 relative group/thumb">
                      <img
                        src={activeDish.imageUrl}
                        alt={activeDish.name}
                        className="w-full h-full object-cover transform group-hover/thumb:scale-110 transition-transform duration-300"
                      />
                      {activeDish.isVeg && (
                        <span className="absolute top-1.5 left-1.5 w-4 h-4 rounded-md bg-zinc-950/90 border border-emerald-500 flex items-center justify-center p-0.5 shadow">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        </span>
                      )}
                    </div>

                    {/* Dish Text and CTA */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {activeDish.badge}
                        </span>
                        {activeDish.isSpicy && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5" /> Spicy
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 ml-auto">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{activeDish.rating}</span>
                        </div>
                      </div>

                      <h3 className="font-display font-bold text-base sm:text-lg text-white truncate mt-1">
                        {activeDish.name}
                      </h3>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">
                        {activeDish.description}
                      </p>

                      <div className="flex items-center justify-between gap-3 mt-2.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-display font-extrabold text-lg text-white">
                            ₹{activeDish.price}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            • {activeDish.prepTime}m fresh prep
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleQuickAddDish(activeDish)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Order</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Quick-Select Chips */}
                  <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {SPOTLIGHT_DISHES.map((dish, i) => (
                      <button
                        key={dish.id}
                        onClick={() => setSelectedDishIndex(i)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                          selectedDishIndex === i
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-zinc-800/60 text-zinc-400 hover:text-white border border-zinc-700/40'
                        }`}
                      >
                        <span>{dish.name.split(' ')[0]}</span>
                        <span className="opacity-60">₹{dish.price}</span>
                      </button>
                    ))}
                  </div>

                  {/* Toast notification when item is added */}
                  {addedNotice && (
                    <div className="absolute inset-x-4 bottom-3 py-2 px-3 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xl animate-fade-in backdrop-blur-md">
                      <Check className="w-4 h-4" />
                      <span>Added &ldquo;{addedNotice}&rdquo; to your order!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
