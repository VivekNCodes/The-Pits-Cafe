'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Flame,
  Utensils,
  Pizza,
  Coffee,
  Sandwich,
  Wine,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { FoodCard, FoodCardItem } from './FoodCard';

export interface CategoryWithItems {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  foodItems: FoodCardItem[];
}

interface MenuSectionProps {
  restaurantSlug: string;
  initialCategories: CategoryWithItems[];
}

export function MenuSection({ restaurantSlug, initialCategories }: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodCardItem[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/restaurant/${restaurantSlug}/search?q=${encodeURIComponent(searchQuery)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (e) {
        console.error('Search failed', e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, restaurantSlug]);

  // Extract all items across categories
  const allItems = initialCategories.flatMap((cat) => cat.foodItems);

  // Category matching
  const categoryFilters = [
    { id: 'all', label: 'All Items', shortLabel: 'All', icon: Layers },
    { id: 'burgers', label: 'Burgers', shortLabel: 'Burgers', icon: Sandwich },
    { id: 'pizzas', label: 'Pizzas', shortLabel: 'Pizzas', icon: Pizza },
    { id: 'pasta', label: 'Pasta', shortLabel: 'Pasta', icon: Utensils },
    { id: 'fries', label: 'Fries', shortLabel: 'Fries', icon: Utensils },
    { id: 'beverages', label: 'Beverages', shortLabel: 'Beverages', icon: Coffee },
    { id: 'bestsellers', label: 'Bestsellers', shortLabel: 'Bestsellers', icon: Sparkles },
  ];

  // Filter items
  let displayedItems: FoodCardItem[] = [];

  if (searchResults !== null) {
    displayedItems = searchResults;
  } else if (selectedCategory === 'all') {
    displayedItems = allItems;
  } else if (selectedCategory === 'bestsellers') {
    displayedItems = allItems.filter((i) => i.isBestseller);
  } else {
    // Find category by slug or name substring
    const matchedCategory = initialCategories.find(
      (c) =>
        c.slug.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        c.name.toLowerCase().includes(selectedCategory.toLowerCase())
    );
    if (matchedCategory) {
      displayedItems = matchedCategory.foodItems;
    } else {
      // Fallback: search in allItems by name or description
      displayedItems = allItems.filter(
        (i) =>
          i.name.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          (i.description && i.description.toLowerCase().includes(selectedCategory.toLowerCase()))
      );
    }
  }

  return (
    <section id="menu" className="py-10 sm:py-16 bg-[#F8F9FA] text-zinc-900 border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Screen 2: OUR MENU Dark Banner Header */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-[#0F1015] text-white p-6 sm:p-10 mb-8 sm:mb-10 overflow-hidden shadow-xl border border-zinc-800">
          {/* Ambient red glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
            <div className="md:col-span-8 text-left space-y-2">
              <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tight uppercase">
                OUR MENU
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base font-medium">
                Burgers, pizzas, pasta, fries and more.
              </p>
              <p className="text-zinc-400 text-xs sm:text-sm">
                Good food for every kind of ride.
              </p>
            </div>

            <div className="hidden md:flex md:col-span-4 justify-end">
              <div className="relative w-44 h-28 rounded-2xl overflow-hidden border border-zinc-700/60 shadow-lg">
                <img
                  src="/images/loaded-fries.jpg"
                  alt="Our Menu Specialties"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Filter Bar: Horizontal Category Pills + Search input */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          
          {/* Horizontal Pills matching Screen 2 */}
          <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categoryFilters.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearchQuery('');
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200'
                }`}
              >
                {cat.shortLabel}
              </button>
            ))}
          </div>

          {/* Search Input matching Screen 2 */}
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-zinc-200 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm"
            />
          </div>

        </div>

        {/* Main Content Area: Left Vertical Sidebar + Right Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Vertical Category Sidebar (Screen 2) */}
          <div className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-zinc-200/90 p-3 shadow-sm sticky top-24">
            <div className="space-y-1">
              {categoryFilters.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-red-50 text-red-600 border border-red-200/80 shadow-sm'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent
                        className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-zinc-400'}`}
                      />
                      <span>{cat.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-red-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Food Cards Grid */}
          <div className="lg:col-span-9">
            {displayedItems.length === 0 ? (
              <div className="rounded-2xl bg-white border border-zinc-200 p-12 text-center">
                <Utensils className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <h3 className="font-display font-bold text-lg text-zinc-900">No dishes found</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Try checking another category or clearing your search term.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md hover:bg-red-700 transition-colors"
                >
                  View All Items
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {displayedItems.map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
