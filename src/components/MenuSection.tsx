'use client';

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Flame, X, Utensils } from 'lucide-react';
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
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'bestsellers' | 'spicy'>('all');
  const [searchResults, setSearchResults] = useState<FoodCardItem[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced smart search
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

  // Apply filters
  let displayedItems: FoodCardItem[] = [];

  if (searchResults !== null) {
    displayedItems = searchResults;
  } else if (selectedCategory === 'all') {
    displayedItems = allItems;
  } else {
    const matchedCategory = initialCategories.find((c) => c.slug === selectedCategory);
    displayedItems = matchedCategory ? matchedCategory.foodItems : [];
  }

  // Dietary filter
  if (dietaryFilter === 'veg') {
    displayedItems = displayedItems.filter((i) => i.isVeg);
  } else if (dietaryFilter === 'bestsellers') {
    displayedItems = displayedItems.filter((i) => i.isBestseller);
  } else if (dietaryFilter === 'spicy') {
    displayedItems = displayedItems.filter((i) => i.isSpicy);
  }

  return (
    <section id="menu" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Title */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        <span className="text-xs uppercase tracking-widest font-semibold text-brand-400 mb-2 block">
          Freshly Crafted For You
        </span>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          Explore Our Menu
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2">
          From fiery peri peri maggi to toasted gourmet artisan sandwiches and stone-oven pizzas.
        </p>
      </div>

      {/* Smart Search Bar with typo tolerance notice */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search dishes (e.g. 'panner toast', 'maggi', 'burger', 'cofee')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-darkSurface-card border border-darkSurface-border text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 shadow-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-[11px] text-zinc-500 mt-1.5 px-2">
            Tip: Smart fuzzy search active — spelling mistakes & aliases automatically resolved.
          </p>
        )}
      </div>

      {/* Dietary Quick Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <button
          onClick={() => setDietaryFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            dietaryFilter === 'all'
              ? 'bg-zinc-200 text-zinc-950 font-semibold shadow-sm'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setDietaryFilter('veg')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            dietaryFilter === 'veg'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Pure Veg
        </button>
        <button
          onClick={() => setDietaryFilter('bestsellers')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            dietaryFilter === 'bestsellers'
              ? 'bg-amberGold/20 text-amberGold border border-amberGold/40 font-semibold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Sparkles className="w-3 h-3 text-amberGold" />
          Bestsellers
        </button>
        <button
          onClick={() => setDietaryFilter('spicy')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            dietaryFilter === 'spicy'
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-semibold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Flame className="w-3 h-3 text-red-400" />
          Spicy Specials
        </button>
      </div>

      {/* Category Pills (horizontal scrollable) */}
      {!searchQuery && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand-600 text-white shadow-glow'
                : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            All Categories ({allItems.length})
          </button>
          {initialCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {cat.name} ({cat.foodItems.length})
            </button>
          ))}
        </div>
      )}

      {/* Food Items Grid */}
      {isSearching ? (
        <div className="py-20 text-center text-zinc-400">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Searching fresh menu items...</p>
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-8">
          <Utensils className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-200">No dishes found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            We couldn't find any dishes matching "{searchQuery || dietaryFilter}". Try exploring another category or clearing filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {displayedItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
