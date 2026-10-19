'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Plus, Minus, Check, Flame, Sparkles } from 'lucide-react';
import { FoodCardItem } from './FoodCard';
import { useCart } from '@/context/CartContext';

interface FoodDetailModalProps {
  item: FoodCardItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FoodDetailModal({ item, isOpen, onClose }: FoodDetailModalProps) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [customOptions, setCustomOptions] = useState<{
    extraCheese: boolean;
    extraPortion: boolean;
    makeSpicy: boolean;
  }>({
    extraCheese: false,
    extraPortion: false,
    makeSpicy: false,
  });

  // Selected custom add-ons from database if available
  const [selectedDbAddons, setSelectedDbAddons] = useState<
    Array<{ id: string; name: string; price: number }>
  >([]);

  useEffect(() => {
    if (item) {
      setSelectedImage(item.imageUrl || '/images/pit-monster-burger.jpg');
      setQuantity(1);
      setCustomOptions({
        extraCheese: false,
        extraPortion: false,
        makeSpicy: item.isSpicy ?? false,
      });
      setSelectedDbAddons([]);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  // Calculate pricing
  let addOnsPrice = 0;
  if (customOptions.extraCheese) addOnsPrice += 30;
  if (customOptions.extraPortion) addOnsPrice += 60;
  addOnsPrice += selectedDbAddons.reduce((sum, a) => sum + a.price, 0);

  const finalUnitPrice = item.price + addOnsPrice;
  const totalPrice = finalUnitPrice * quantity;

  // Generate thumbnail set (active image + 2 decorative angle variants if none exist)
  const mainImg = item.imageUrl || '/images/pit-monster-burger.jpg';
  const thumbnails = [
    mainImg,
    '/images/loaded-fries.jpg',
    '/images/peri-peri-pasta.jpg',
  ];

  const handleAddToCart = () => {
    const addonsToSave: Array<{ id: string; name: string; price: number }> = [...selectedDbAddons];
    if (customOptions.extraCheese) {
      addonsToSave.push({ id: 'extra-cheese', name: 'Extra Cheese', price: 30 });
    }
    if (customOptions.extraPortion) {
      addonsToSave.push({ id: 'extra-patty', name: 'Extra Portion/Patty', price: 60 });
    }
    if (customOptions.makeSpicy) {
      addonsToSave.push({ id: 'make-spicy', name: 'Make it Spicy', price: 0 });
    }

    addItem({
      foodItemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl || undefined,
      isVeg: item.isVeg,
      quantity,
      selectedAddons: addonsToSave,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl sm:rounded-3xl bg-[#111217] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors shadow-lg"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 sm:p-7">
            
            {/* Left Column: Big Image + Thumbnails */}
            <div className="md:col-span-6 flex flex-col gap-3">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-inner">
                <img
                  src={selectedImage}
                  alt={item.name}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />
              </div>

              {/* 3 Thumbnails matching Screen 4 */}
              <div className="grid grid-cols-3 gap-2.5">
                {thumbnails.map((thumbUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(thumbUrl)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === thumbUrl
                        ? 'border-red-600 ring-2 ring-red-600/30'
                        : 'border-zinc-800 hover:border-zinc-600 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={thumbUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Dish Info, Tags, Customizations */}
            <div className="md:col-span-6 flex flex-col justify-between text-left">
              <div className="space-y-4">
                
                {/* Bestseller Badge */}
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white tracking-wide shadow-sm">
                    {item.isBestseller ? 'Bestseller' : 'Chef Pick'}
                  </span>
                </div>

                {/* Title & Price */}
                <div>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                    {item.name}
                  </h2>
                  <p className="font-display font-black text-2xl sm:text-3xl text-red-500 mt-1">
                    ₹ {item.price}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {item.description || 'Deliciously grilled and prepared fresh with rich signature spices and soft crust.'}
                </p>

                {/* Meta details matching Screen 4 */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-300">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
                    <Clock className="w-3.5 h-3.5 text-red-500" />
                    <span>{item.preparationTime || 15}-20 mins</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        item.isVeg ? 'bg-emerald-400' : 'bg-red-500'
                      }`}
                    />
                    <span>{item.isVeg ? 'Pure Veg' : 'Non-Veg'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Chef&apos;s Special</span>
                  </div>
                </div>

                {/* Customizations Section */}
                <div className="pt-3 border-t border-zinc-800 space-y-3">
                  <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Customize Your Order
                  </h3>

                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={customOptions.extraCheese}
                          onChange={(e) =>
                            setCustomOptions({ ...customOptions, extraCheese: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-zinc-700 bg-zinc-800"
                        />
                        <span className="text-xs sm:text-sm font-medium text-zinc-200">
                          Extra Cheese
                        </span>
                      </div>
                      <span className="text-xs font-bold text-zinc-400">+₹30</span>
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={customOptions.extraPortion}
                          onChange={(e) =>
                            setCustomOptions({ ...customOptions, extraPortion: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-zinc-700 bg-zinc-800"
                        />
                        <span className="text-xs sm:text-sm font-medium text-zinc-200">
                          Extra Patty / Portion
                        </span>
                      </div>
                      <span className="text-xs font-bold text-zinc-400">+₹60</span>
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={customOptions.makeSpicy}
                          onChange={(e) =>
                            setCustomOptions({ ...customOptions, makeSpicy: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-zinc-700 bg-zinc-800"
                        />
                        <span className="text-xs sm:text-sm font-medium text-zinc-200 flex items-center gap-1.5">
                          <span>Make it Spicy</span>
                          <Flame className="w-3.5 h-3.5 text-red-500" />
                        </span>
                      </div>
                      <span className="text-xs font-bold text-zinc-500">Free</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Bottom Quantity Stepper and Add to Cart Button */}
              <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center gap-3">
                
                {/* Stepper matching Screen 4 */}
                <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-800 px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Red CTA Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all flex items-center justify-center gap-2"
                >
                  <span>Add to Cart</span>
                  <span>•</span>
                  <span>₹ {totalPrice}</span>
                </button>

              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
