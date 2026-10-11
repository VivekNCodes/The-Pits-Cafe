'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Youtube, Twitter, Phone, Mail, MapPin, Clock, ShieldCheck, Heart, Shield, MessageCircle } from 'lucide-react';

interface FooterProps {
  restaurant: {
    slug: string;
    name: string;
    tagline?: string | null;
    description?: string | null;
    address: string;
    city: string;
    pincode: string;
    phone: string;
    email: string;
    openingHours?: string | null;
    googleMapsUrl?: string | null;
    policyTitle?: string | null;
    policyText?: string | null;
    footerCopyright?: string | null;
    socialLinks?: Array<{
      id: string;
      platform: string;
      url: string;
      label: string;
    }>;
  };
}

export function Footer({ restaurant }: FooterProps) {
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      case 'x':
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" />;
      case 'maps':
        return <MapPin className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-zinc-400 text-xs relative overflow-hidden">
      {/* Soft ambient light bloom in footer */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-lg text-white">
              {restaurant.name}
            </h3>
            {restaurant.tagline && (
              <p className="text-zinc-400 text-xs font-medium">{restaurant.tagline}</p>
            )}
            <p className="text-zinc-500 text-xs leading-relaxed">
              {restaurant.description ||
                'Unpretentious gathering spot for food lovers, bikers, and friends.'}
            </p>
            <div className="flex items-center gap-2 pt-2">
              {restaurant.socialLinks?.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-brand-500 transition-colors"
                  aria-label={link.label}
                  title={link.label}
                >
                  {getSocialIcon(link.platform) || <span>🔗</span>}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links (Customer focused) */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm text-zinc-200">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <Link href={`/r/${restaurant.slug}#menu`} className="hover:text-brand-400 transition-colors">
                  Digital Food Menu
                </Link>
              </li>
              <li>
                <Link href={`/r/${restaurant.slug}/reservation`} className="hover:text-brand-400 transition-colors">
                  Table Reservation
                </Link>
              </li>
              <li>
                <Link href={`/r/${restaurant.slug}/history`} className="hover:text-brand-400 transition-colors">
                  Live Order Tracker & History
                </Link>
              </li>
            </ul>
          </div>

          {/* Location & Contact */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm text-zinc-200">
              Find & Contact Us
            </h4>
            <div className="space-y-2 text-zinc-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span>
                  {restaurant.address}, {restaurant.city} - {restaurant.pincode}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <a href={`tel:${restaurant.phone}`} className="hover:text-white">
                  {restaurant.phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <a href={`mailto:${restaurant.email}`} className="hover:text-white">
                  {restaurant.email}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>{restaurant.openingHours || '8:00 AM - 11:00 PM'}</span>
              </p>
            </div>
          </div>

          {/* Operating Policy */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm text-zinc-200">
              Dine-in Policy
            </h4>
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{restaurant.policyTitle || 'Counter Payment Model'}</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                {restaurant.policyText ||
                  'All food is cooked fresh upon order confirmation. Payment is collected at the restaurant counter after dining. No online gateway required.'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar with discreet Staff & Admin Portal link */}
        <div className="mt-12 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          <p>
            {restaurant.footerCopyright ||
              `© ${new Date().getFullYear()} ${restaurant.name}. All rights reserved.`}
          </p>

          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1">
              Crafted for Bikers & Foodies <Heart className="w-3 h-3 text-brand-500" />
            </p>

            {/* Discrete admin access at bottom only */}
            <Link
              href={`/admin/${restaurant.slug}`}
              className="text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1 pl-4 border-l border-zinc-800"
              title="Staff & Management Login"
            >
              <Shield className="w-3 h-3" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
