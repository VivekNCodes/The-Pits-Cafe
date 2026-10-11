import React from 'react';
import { notFound } from 'next/navigation';
import { RestaurantService } from '@/lib/services/restaurant.service';
import { MenuService } from '@/lib/services/menu.service';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { MenuSection } from '@/components/MenuSection';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import Link from 'next/link';
import {
  Calendar,
  Tag,
  MapPin,
  Phone,
  ShieldAlert,
  Sparkles,
  Coffee,
  Clock,
  Star,
  Flame,
  MessageCircle,
  Instagram,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Compass,
  UtensilsCrossed,
  Heart,
} from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const restaurant = await RestaurantService.getBySlug(params.slug);
    if (!restaurant) {
      return { title: 'The Pit Cafe | Rohini Sector 16' };
    }
    return {
      title: `${restaurant.name} | ${restaurant.tagline || 'Biker Courtyard & Midnight Fast Food'}`,
      description:
        restaurant.description ||
        `Welcome to ${restaurant.name} in Sector 16 Rohini. Enjoy viral Pull-Apart Cheesy Garlic Bread, Kurkuri Chaap, Biker Burgers, and thick shakes. Open till 5:00 AM.`,
      openGraph: {
        title: `${restaurant.name} — Rohini's Legendary Biker Pitstop`,
        description: restaurant.description || undefined,
        images: restaurant.heroImageUrl ? [{ url: restaurant.heroImageUrl }] : undefined,
      },
    };
  } catch {
    return { title: 'The Pit Cafe | Rohini Sector 16' };
  }
}

export default async function RestaurantPage({
  params,
}: {
  params: { slug: string };
}) {
  const restaurant = await RestaurantService.getBySlug(params.slug);
  if (!restaurant) {
    notFound();
  }

  const categories = await MenuService.getPublicMenu(restaurant.id);

  // Format categories for client menu
  const formattedCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    foodItems: cat.foodItems.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      description: item.description,
      imageUrl: item.imageUrl,
      preparationTime: item.preparationTime,
      isAvailable: item.isAvailable,
      isVeg: item.isVeg,
      isSpicy: item.isSpicy,
      isFeatured: item.isFeatured,
      isBestseller: item.isBestseller,
      ingredients: item.ingredients,
      allergens: item.allergens,
      addonGroups: item.addonGroups.map((ag) => ({
        id: ag.id,
        title: ag.title,
        minSelect: ag.minSelect,
        maxSelect: ag.maxSelect,
        isRequired: ag.isRequired,
        addons: ag.addons.map((a) => ({
          id: a.id,
          name: a.name,
          price: a.price,
          isAvailable: a.isAvailable,
        })),
      })),
    })),
  }));

  // Fetch active promotional discounts
  const activeDiscounts = await (async () => {
    try {
      const prismaClient = (await import('@/lib/prisma')).default;
      return await prismaClient.discount.findMany({
        where: { restaurantId: restaurant.id, isActive: true },
        take: 3,
      });
    } catch {
      return [];
    }
  })();

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d10] text-zinc-100 selection:bg-amber-500 selection:text-black">
      {/* Maintenance Mode Alert if enabled */}
      {restaurant.maintenanceMode && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 text-amber-300 px-4 py-3 text-center text-xs font-medium flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>
            {restaurant.maintenanceNotice ||
              'Ordering is temporarily paused for routine kitchen prep. You can still browse our full menu.'}
          </span>
        </div>
      )}

      {/* Header */}
      <Header restaurant={restaurant} />

      <main className="flex-1">
        {/* Bespoke Hero Section */}
        <Hero restaurant={restaurant} />

        {/* Promotional Offers Strip */}
        {activeDiscounts.length > 0 && (
          <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-y border-zinc-800/80 py-3.5 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                Active Pitstop Deals:
              </span>
              {activeDiscounts.map((d) => (
                <div
                  key={d.id}
                  className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-zinc-200 flex items-center gap-2"
                >
                  <Tag className="w-3 h-3 text-amber-400" />
                  <span className="font-semibold text-white">{d.title}:</span>
                  <span className="text-amber-300 font-mono">
                    {d.discountType === 'PERCENTAGE'
                      ? `${d.discountValue}% OFF`
                      : `₹${d.discountValue} OFF`}
                    {d.minOrderValue > 0 ? ` on orders > ₹${d.minOrderValue}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: The Pit Cafe Viral Specialties Showcase */}
        <section className="py-16 sm:py-20 border-b border-zinc-800/80 bg-gradient-to-b from-[#0c0d10] via-[#111317] to-[#0c0d10] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Rohini’s Crave List
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                Our Signature Pitstop Hits
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2">
                Handcrafted recipes that built our reputation among night riders, college squads, and Delhi foodies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Card 1: Pull-Apart Garlic Bread */}
              <div className="group rounded-3xl bg-zinc-900/60 border border-zinc-800/90 overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between">
                <div>
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src="/images/pull-apart-garlic-bread.jpg"
                      alt="Pull-Apart Cheesy Garlic Bread"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-black shadow-lg">
                      Viral Bestseller 🔥
                    </span>
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-black/80 backdrop-blur-md text-white border border-zinc-700">
                      ₹180
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                      Pull-Apart Cheesy Garlic Bread
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Warm sourdough loaf stuffed with rich molten mozzarella cheese pull, minced roasted garlic butter, parsley, and chili flakes.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <Link
                    href="#menu"
                    className="w-full py-2.5 rounded-xl bg-zinc-800/80 hover:bg-amber-500 hover:text-black text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Order on Menu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 2: Kurkuri Soya Chaap Sticks */}
              <div className="group rounded-3xl bg-zinc-900/60 border border-zinc-800/90 overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between">
                <div>
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src="/images/kurkuri-chaap.jpg"
                      alt="Kurkuri Soya Chaap Sticks"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-orange-600 text-white shadow-lg">
                      Crunch Favorite ⚡
                    </span>
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-black/80 backdrop-blur-md text-white border border-zinc-700">
                      ₹160
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                      Kurkuri Soya Chaap Sticks
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Juicy soya chaap encased in ultra-crunchy cornflake crumb, seasoned with Delhi street chaat masala, served with mint dip & onions.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <Link
                    href="#menu"
                    className="w-full py-2.5 rounded-xl bg-zinc-800/80 hover:bg-amber-500 hover:text-black text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Order on Menu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 3: The Pit Monster Biker Burger */}
              <div className="group rounded-3xl bg-zinc-900/60 border border-zinc-800/90 overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between">
                <div>
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src="/images/pit-monster-burger.jpg"
                      alt="The Pit Monster Biker Burger"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-black shadow-lg">
                      Chef Heavyweight 🍔
                    </span>
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-black/80 backdrop-blur-md text-white border border-zinc-700">
                      ₹220
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                      The Pit Monster Biker Burger
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Double crisp patty, double dripping cheddar, caramelized onions, sliced jalapeños, and secret house chipotle sauce on brioche.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <Link
                    href="#menu"
                    className="w-full py-2.5 rounded-xl bg-zinc-800/80 hover:bg-amber-500 hover:text-black text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Order on Menu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Digital Food Menu */}
        <MenuSection
          restaurantSlug={restaurant.slug}
          initialCategories={formattedCategories}
        />

        {/* Section: The Pit Cafe Experience Pillars */}
        <section className="py-16 sm:py-24 border-t border-zinc-800/80 bg-zinc-950 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs uppercase tracking-widest font-bold text-amber-400 mb-2 block">
                More Than Just A Cafe
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                Why Delhi Rides to The Pit
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2">
                Built specifically for riders, midnight adventurers, and friend groups looking for honest, high-energy comfort dining.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1: Biker Courtyard */}
              <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/40 transition-colors space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  Biker Courtyard Deck
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Park your motorcycle directly along the open-air courtyard deck. Sit under glowing ambient string lights with great music and company.
                </p>
              </div>

              {/* Feature 2: Open Till 5 AM */}
              <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/40 transition-colors space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  Open Late Night Till 5 AM
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  While the rest of the city shuts down, our kitchen keeps cooking hot burgers, cheese garlic bread, and peri-peri Maggi throughout the night.
                </p>
              </div>

              {/* Feature 3: Frictionless QR Dine-in */}
              <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/40 transition-colors space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  Contactless QR Ordering
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Take a table, scan the QR with your smartphone, customize toppings, and order in seconds with zero waiting for waitstaff.
                </p>
              </div>

              {/* Feature 4: Zero-Wait Counter Payment */}
              <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/40 transition-colors space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  Pay at Counter Model
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Transparent dining without gateway payment failures or hidden convenience fees. Settle your bill at the counter via UPI, Cash, or Cards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Authentic Courtyard Story & Heritage */}
        <section id="story" className="py-20 border-t border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-[#101216] to-zinc-950 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Courtyard Image with Badge */}
              <div className="lg:col-span-6 relative group">
                <div className="relative rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900">
                  <img
                    src="/images/pit-cafe-courtyard.jpg"
                    alt="The Pit Cafe Rohini Courtyard At Night"
                    className="w-full h-80 sm:h-[420px] object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-85" />
                  
                  <div className="absolute bottom-4 left-4 right-4 p-4 sm:p-5 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-zinc-700/60 shadow-xl">
                    <p className="font-display font-bold text-sm text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      The Pitstop Courtyard · Rohini Sector 16
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      {restaurant.address}, {restaurant.city} - {restaurant.pincode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Narrative & Philosophy */}
              <div className="lg:col-span-6 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Coffee className="w-3.5 h-3.5 text-amber-400" />
                  <span>The Pit Cafe Story</span>
                </div>

                <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                  Born for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">Open Road</span> & Midnight Cravings
                </h2>

                <div className="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed">
                  <p>
                    {restaurant.aboutText ||
                      'Born in Sector 16 Rohini out of a deep passion for open roads, superbikes, and unapologetically rich comfort food. The Pit Cafe was created as an unpretentious pitstop: an open-air courtyard where bikers park their machines right beside the tables, friends pull together under string lights, and the kitchen keeps firing fresh, sizzling bites until 5:00 AM.'}
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    From our viral pull-apart garlic breads loaded with real mozzarella to street-style kurkure chaap and thick Belgian chocolate shakes, everything is prepared fresh from scratch right after you place your order.
                  </p>
                </div>

                {/* Direct quick contact indicators */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="tel:+919717780445"
                    className="flex items-center gap-2 text-xs text-zinc-200 bg-zinc-900 px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-amber-500 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>+91 97177 80445</span>
                  </a>
                  <a
                    href="https://www.instagram.com/thepitcafe_rohini_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-zinc-200 bg-zinc-900 px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-amber-500 transition-colors"
                  >
                    <Instagram className="w-4 h-4 text-pink-400" />
                    <span>@thepitcafe_rohini_</span>
                  </a>
                  <div className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-900 px-4 py-2.5 rounded-xl border border-zinc-800">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>10:00 AM – 5:00 AM</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section: Verified Google Reviews & Social Proof */}
        <section className="py-16 sm:py-20 border-t border-zinc-800/80 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
                <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                Google Verified Ratings (4.6 / 5.0)
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                What Diners & Riders Say
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2">
                Real customer feedback from our Rohini regulars, bike clubs, and night-shift squads.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Review 1 */}
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed">
                  &ldquo;The pull-apart cheesy garlic bread here is absolutely viral for a reason! That cheese pull is insane. We ride all the way from Pitampura on weekend nights just for this and the thick cold coffee.&rdquo;
                </p>
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Aman Sharma</span>
                  <span className="text-zinc-500">Biker & Local Guide</span>
                </div>
              </div>

              {/* Review 2 */}
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed">
                  &ldquo;Being open till 5 AM has saved us so many times during college project submissions and late night drives. The Kurkuri Chaap is super crunchy and the QR table ordering makes everything effortless.&rdquo;
                </p>
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Rohan Verma</span>
                  <span className="text-zinc-500">DTU Student</span>
                </div>
              </div>

              {/* Review 3 */}
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed">
                  &ldquo;The outdoor courtyard with fairy lights gives authentic cafe culture vibes. Huge burgers, great portion sizes, and paying directly at the counter without card machine hassles is awesome.&rdquo;
                </p>
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Pooja Malhotra</span>
                  <span className="text-zinc-500">Sector 16 Resident</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Live Google Maps & Direct Contact Card */}
        <section className="py-16 sm:py-20 border-t border-zinc-800/80 bg-gradient-to-b from-[#0e1014] to-[#0c0d10]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Direct Address & Quick Connect */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Find Us in Rohini</span>
                </div>

                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                  Visit The Pit Cafe
                </h2>

                <div className="space-y-4 text-xs sm:text-sm text-zinc-300">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                    <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">Exact Address:</p>
                      <p className="text-zinc-400 mt-0.5 leading-relaxed">
                        House 5/114, Pocket 5, Sector 16, Rohini, New Delhi - 110089
                      </p>
                      <p className="text-[11px] text-amber-400/90 mt-1 font-medium">
                        Landmark: Near Bawana Road / Sector 16 Market
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                    <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-white">Operating Hours:</p>
                      <p className="text-zinc-400 mt-0.5">
                        Everyday: 10:00 AM – 5:00 AM (Late Night Hub)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                    <Phone className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-white">Phone & Table Enquiries:</p>
                      <a href="tel:+919717780445" className="text-amber-400 hover:underline">
                        +91 97177 80445
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=THE+PIT+CAFE+Sector+16+Rohini+New+Delhi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Get Directions on Google Maps</span>
                  </a>

                  <a
                    href="https://wa.me/919717780445"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-400 font-semibold text-xs border border-zinc-800 flex items-center gap-2 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Interactive Google Maps Embed */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl h-80 sm:h-96 relative bg-zinc-900">
                  <iframe
                    title="The Pit Cafe Location Map"
                    src="https://maps.google.com/maps?q=THE%20PIT%20CAFE%20Sector%2016%20Rohini%20Delhi&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(1.1)' }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  
                  {/* Floating directions chip */}
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=THE+PIT+CAFE+Sector+16+Rohini+New+Delhi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 px-3.5 py-2 rounded-xl bg-black/90 backdrop-blur-md border border-zinc-700 text-xs font-bold text-white flex items-center gap-2 hover:border-amber-500 transition-colors shadow-2xl"
                  >
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>Open in Maps App</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section: Table Reservation CTA */}
        {restaurant.reservationsEnabled && (
          <section className="py-16 sm:py-20 bg-gradient-to-t from-zinc-950 via-[#121419] to-[#0c0d10] border-t border-zinc-800">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                <Calendar className="w-7 h-7" />
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                Planning a Midnight Ride or Gathering?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
                Reserve your table ahead of time in our outdoor biker courtyard or indoor booths. Guaranteed table availability with zero waiting.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/r/${restaurant.slug}/reservation`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reserve Courtyard Table Now</span>
                </Link>

                <a
                  href="tel:+919717780445"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-sm border border-zinc-800 transition-all"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Call: +91 97177 80445</span>
                </a>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer restaurant={restaurant} />

      {/* Cart Drawer */}
      <CartDrawer
        restaurantSlug={restaurant.slug}
        restaurantName={restaurant.name}
      />
    </div>
  );
}
