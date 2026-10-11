'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { FoodCardItem } from './FoodCard';
import { useCart } from '@/context/CartContext';

interface CustomizationModalProps {
  item: FoodCardItem;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomizationModal({ item, isOpen, onClose }: CustomizationModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (!isOpen) return null;

  const toggleAddon = (addon: { id: string; name: string; price: number }) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const totalItemPrice = (item.price + addonsTotal) * quantity;

  const handleAddToCart = () => {
    addItem({
      foodItemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl || undefined,
      isVeg: item.isVeg,
      quantity,
      selectedAddons,
      specialInstructions: specialInstructions.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-darkSurface-card border border-darkSurface-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="relative aspect-[16/8] w-full bg-zinc-900 overflow-hidden flex-shrink-0">
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-darkSurface-card via-darkSurface-card/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-zinc-300 hover:text-white backdrop-blur-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="font-display font-bold text-xl text-white">
              {item.name}
            </h2>
            <p className="text-xs text-brand-400 font-medium">Base Price: ₹{item.price}</p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {item.description && (
            <p className="text-xs text-zinc-400 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Add-on Groups */}
          {item.addonGroups?.map((group) => (
            <div key={group.id} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amberGold" />
                  {group.title}
                </span>
                <span className="text-[11px] text-zinc-500">Optional</span>
              </div>

              <div className="space-y-2">
                {group.addons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                        isChecked
                          ? 'bg-brand-500/10 border-brand-500/50 text-white'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isChecked
                              ? 'bg-brand-500 border-brand-500 text-white'
                              : 'border-zinc-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-medium">{addon.name}</span>
                      </div>
                      <span className="font-semibold text-brand-400">+₹{addon.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Instructions (Section 18) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
              Special Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Less spicy, Extra crispy, No onions..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              maxLength={120}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Modal Footer with Quantity and Confirm */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-4 flex-shrink-0">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-2 bg-zinc-900 px-2 py-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 rounded-md text-zinc-400 hover:text-white"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-display font-semibold text-sm w-5 text-center text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 rounded-md text-zinc-400 hover:text-white"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-sm shadow-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-between"
          >
            <span>Add to Cart</span>
            <span>₹{totalItemPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
