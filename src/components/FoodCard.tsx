'use client';

import React, { useState } from 'react';
import { Plus, Check, Sparkles, Flame, Clock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { FoodDetailModal } from './FoodDetailModal';

export interface FoodCardItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  preparationTime: number;
  isAvailable: boolean;
  isVeg: boolean;
  isSpicy?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  ingredients?: string | null;
  allergens?: string | null;
  addonGroups?: Array<{
    id: string;
    title: string;
    minSelect: number;
    maxSelect: number;
    isRequired: boolean;
    addons: Array<{ id: string; name: string; price: number; isAvailable: boolean }>;
  }>;
}

export function FoodCard({ item }: { item: FoodCardItem }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [addedEffect, setAddedEffect] = useState(false);
  const { addItem } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.isAvailable) return;

    addItem({
      foodItemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl || undefined,
      isVeg: item.isVeg,
      quantity: 1,
      selectedAddons: [],
    });

    setAddedEffect(true);
    setTimeout(() => setAddedEffect(false), 900);
  };

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className={`group relative rounded-2xl bg-white border border-zinc-200/90 shadow-sm hover:shadow-xl hover:border-red-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
          !item.isAvailable ? 'opacity-50 grayscale' : ''
        }`}
      >
        {/* Top Image Container matching Screen 2 */}
        <div className="relative aspect-[16/11] w-full overflow-hidden bg-zinc-100 flex-shrink-0">
          <img
            src={item.imageUrl || '/images/pit-monster-burger.jpg'}
            alt={item.name}
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badge Overlays matching Screen 2 */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10 pointer-events-none">
            {item.isBestseller && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-md">
                Bestseller
              </span>
            )}
            {item.isSpicy && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-md">
                <Flame className="w-2.5 h-2.5" />
                Spicy
              </span>
            )}
          </div>

          {/* Veg / Non-Veg Indicator */}
          <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-md bg-white/90 backdrop-blur-md border shadow-sm ${
                item.isVeg ? 'border-emerald-600' : 'border-red-600'
              }`}
              title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                }`}
              />
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col justify-between text-left">
          <div>
            <h3 className="font-display font-bold text-base text-zinc-900 group-hover:text-red-600 transition-colors line-clamp-1">
              {item.name}
            </h3>
            <p className="text-[12px] text-zinc-500 line-clamp-2 mt-1 leading-snug">
              {item.description || 'Prepared fresh with signature ingredients and spices.'}
            </p>
          </div>

          {/* Bottom Row: Price and Red "Add +" Button matching Screen 2 */}
          <div className="flex items-center justify-between gap-2 mt-3 pt-2">
            <div className="flex items-baseline gap-1">
              <span className="font-display font-extrabold text-base sm:text-lg text-zinc-900">
                ₹ {item.price}
              </span>
            </div>

            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!item.isAvailable}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95 shadow-sm ${
                addedEffect
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {addedEffect ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <span>Add</span>
                  <Plus className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Food Detail Modal (Screen 4) */}
      <FoodDetailModal
        item={item}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
