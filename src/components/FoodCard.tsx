'use client';

import React, { useState } from 'react';
import { Clock, Plus, Sparkles, Flame, Check } from 'lucide-react';
import { CustomizationModal } from './CustomizationModal';
import { useCart } from '@/context/CartContext';

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

  const hasCustomizations = item.addonGroups && item.addonGroups.length > 0;

  const handleAddClick = () => {
    if (!item.isAvailable) return;

    if (hasCustomizations) {
      setModalOpen(true);
    } else {
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
    }
  };

  return (
    <>
      <div className={`group relative rounded-2xl bg-darkSurface-card border border-darkSurface-border card-hover flex flex-col justify-between overflow-hidden transition-all duration-300 ${!item.isAvailable ? 'opacity-60 grayscale-[30%]' : ''}`}>
        {/* Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs">
              Freshly Prepared
            </div>
          )}

          {/* Dark gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-darkSurface-card via-transparent to-transparent opacity-80" />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            {/* Veg / Non-Veg Indicator */}
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-md bg-black/60 backdrop-blur-md border ${
                item.isVeg ? 'border-emerald-500' : 'border-rose-500'
              }`}
              title={item.isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  item.isVeg ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
            </span>

            {/* Bestseller Badge */}
            {item.isBestseller && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amberGold/20 text-amberGold border border-amberGold/30 backdrop-blur-md">
                <Sparkles className="w-2.5 h-2.5" />
                Bestseller
              </span>
            )}

            {/* Spicy Badge */}
            {item.isSpicy && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-md">
                <Flame className="w-2.5 h-2.5" />
                Spicy
              </span>
            )}
          </div>

          {/* Prep time badge */}
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/70 text-zinc-300 backdrop-blur-md border border-white/10">
              <Clock className="w-3 h-3 text-brand-400" />
              {item.preparationTime} mins
            </span>
          </div>

          {/* Sold out overlay */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20">
              <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold uppercase tracking-wider">
                Sold Out Today
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-display font-semibold text-base text-zinc-100 group-hover:text-brand-400 transition-colors leading-snug">
                {item.name}
              </h3>
            </div>

            {item.description && (
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                {item.description}
              </p>
            )}

            {item.allergens && (
              <p className="text-[10px] text-zinc-500 mb-3">
                Contains: <span className="text-zinc-400">{item.allergens}</span>
              </p>
            )}
          </div>

          {/* Price & Add Action */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 mt-auto">
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 font-medium">Price</span>
              <span className="font-display font-bold text-lg text-white">
                ₹{item.price}
              </span>
            </div>

            <button
              onClick={handleAddClick}
              disabled={!item.isAvailable}
              className={`relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium text-xs transition-all active:scale-95 ${
                !item.isAvailable
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  : addedEffect
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 hover:bg-brand-600 text-zinc-200 hover:text-white border border-zinc-700/60 hover:border-brand-500 shadow-sm'
              }`}
            >
              {addedEffect ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Added
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  {hasCustomizations ? 'Customize' : 'Add'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {modalOpen && (
        <CustomizationModal
          item={item}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
