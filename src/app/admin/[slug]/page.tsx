'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  UtensilsCrossed,
  QrCode,
  Calendar,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  LogOut,
  RefreshCw,
  Plus,
  Printer,
  Download,
  Eye,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Flame,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  Camera,
  Crop,
  X,
  Image as ImageIcon,
  BookOpen,
  Share2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Sparkles,
  Coffee,
  MessageCircle,
} from 'lucide-react';
import { ImageCropperModal } from '@/components/ImageCropperModal';

export default function AdminDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantSlug = params.slug as string;

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ORDERS' | 'TABLES_QR' | 'MENU_CMS' | 'RESERVATIONS' | 'SETTINGS'>('DASHBOARD');

  const [restaurant, setRestaurant] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [menuCategories, setMenuCategories] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Status filter in Orders tab
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');

  // QR Modal preview
  const [selectedQRTable, setSelectedQRTable] = useState<any>(null);
  const [qrModalDataUrl, setQrModalDataUrl] = useState<string | null>(null);

  // Print Mode State for Table QR Sheet
  const [isPrintMode, setIsPrintMode] = useState(false);

  // New Table Modal
  const [newTableModal, setNewTableModal] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [newTableLocation, setNewTableLocation] = useState('Biker Courtyard');

  // Food Item Modal State (supports both Adding New & Updating Existing)
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [editingFoodItemId, setEditingFoodItemId] = useState<string | null>(null);
  const [foodCategoryId, setFoodCategoryId] = useState('');
  const [foodName, setFoodName] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [foodPrepTime, setFoodPrepTime] = useState('15');
  const [foodDescription, setFoodDescription] = useState('');
  const [foodIsVeg, setFoodIsVeg] = useState(true);
  const [foodIsSpicy, setFoodIsSpicy] = useState(false);
  const [foodIsBestseller, setFoodIsBestseller] = useState(false);
  const [foodImageUrl, setFoodImageUrl] = useState('');

  // Image Cropper Modal State (for device upload & canvas crop)
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // Confirm delete item ID
  const [confirmDeleteItemId, setConfirmDeleteItemId] = useState<string | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<any>(null);
  const [settingsSavedNotice, setSettingsSavedNotice] = useState(false);

  // Verify authentication first
  useEffect(() => {
    async function checkAuth() {
      try {
        const authRes = await fetch(`/api/restaurant/${restaurantSlug}/auth`);
        const authData = await authRes.json();
        if (!authData.authenticated) {
          router.push(`/admin/${restaurantSlug}/login`);
          return;
        }
        loadAllData();
      } catch {
        router.push(`/admin/${restaurantSlug}/login`);
      }
    }
    if (restaurantSlug) checkAuth();
  }, [restaurantSlug]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Restaurant Details
      const resRest = await fetch(`/api/restaurant/${restaurantSlug}`);
      if (resRest.ok) {
        const restJson = await resRest.json();
        setRestaurant(restJson);
        const sLinks = restJson.socialLinks || [];
        setSettingsForm({
          name: restJson.name || '',
          tagline: restJson.tagline || '',
          logoUrl: restJson.logoUrl || '',
          heroHeading: restJson.heroHeading || '',
          heroSubtitle: restJson.heroSubtitle || '',
          heroImageUrl: restJson.heroImageUrl || '',

          // Our Story
          aboutHeading: restJson.aboutHeading || 'Our Story',
          aboutText: restJson.aboutText || '',
          storyImageUrl: restJson.storyImageUrl || '/images/our-story.jpg',

          // Footer & Policies
          description: restJson.description || '',
          policyTitle: restJson.policyTitle || 'Counter Payment Model',
          policyText: restJson.policyText || 'All food is cooked fresh upon order confirmation. Payment is collected at the restaurant counter after dining. No online gateway required.',
          footerCopyright: restJson.footerCopyright || `© ${new Date().getFullYear()} ${restJson.name}. All rights reserved.`,

          // Contact & Location
          address: restJson.address || '',
          city: restJson.city || 'New Delhi',
          pincode: restJson.pincode || '110089',
          phone: restJson.phone || '',
          email: restJson.email || '',
          googleMapsUrl: restJson.googleMapsUrl || '',
          openingHours: restJson.openingHours || '8:00 AM - 11:00 PM',

          // Social Links
          instagramUrl: sLinks.find((s: any) => s.platform.toLowerCase() === 'instagram')?.url || '',
          facebookUrl: sLinks.find((s: any) => s.platform.toLowerCase() === 'facebook')?.url || '',
          whatsappUrl: sLinks.find((s: any) => s.platform.toLowerCase() === 'whatsapp')?.url || '',
          mapsUrl: sLinks.find((s: any) => s.platform.toLowerCase() === 'maps')?.url || restJson.googleMapsUrl || '',
          youtubeUrl: sLinks.find((s: any) => s.platform.toLowerCase() === 'youtube')?.url || '',
          twitterUrl: sLinks.find((s: any) => s.platform.toLowerCase() === 'x' || s.platform.toLowerCase() === 'twitter')?.url || '',

          // Operations
          dineInEnabled: restJson.dineInEnabled ?? true,
          takeawayEnabled: restJson.takeawayEnabled ?? true,
          reservationsEnabled: restJson.reservationsEnabled ?? true,
          maintenanceMode: restJson.maintenanceMode ?? false,
          maintenanceNotice: restJson.maintenanceNotice || '',
          taxPercentage: restJson.taxPercentage ?? 5.0,
          serviceChargePercentage: restJson.serviceChargePercentage ?? 0.0,
          welcomeGreetingHeading: restJson.welcomeGreetingHeading || 'Welcome to The Pit Cafe',
          welcomeGreetingMessage: restJson.welcomeGreetingMessage || 'Browse our freshly prepared menu and place your order directly from your table.',
          qrCtaText: restJson.qrCtaText || 'View Menu & Order',
        });
      }

      // 2. Metrics
      const resMetrics = await fetch(`/api/restaurant/${restaurantSlug}/analytics`);
      if (resMetrics.ok) {
        setMetrics(await resMetrics.json());
      }

      // 3. Orders
      const resOrders = await fetch(`/api/restaurant/${restaurantSlug}/orders`);
      if (resOrders.ok) {
        setOrders(await resOrders.json());
      }

      // 4. Tables
      const resTables = await fetch(`/api/restaurant/${restaurantSlug}/tables`);
      if (resTables.ok) {
        setTables(await resTables.json());
      }

      // 5. Menu CMS (all items including hidden)
      const resMenu = await fetch(`/api/restaurant/${restaurantSlug}/menu?admin=true`);
      if (resMenu.ok) {
        const menuJson = await resMenu.json();
        setMenuCategories(menuJson);
        if (menuJson.length > 0) {
          setFoodCategoryId(menuJson[0].id);
        }
      }

      // 6. Reservations
      const resRes = await fetch(`/api/restaurant/${restaurantSlug}/reservations`);
      if (resRes.ok) {
        setReservations(await resRes.json());
      }
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  // Setup Real-time SSE updates for admin
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/restaurant/${restaurantSlug}/events`);
      eventSource.addEventListener('liveOrders', (e) => {
        try {
          const liveOrders = JSON.parse(e.data);
          // Auto update orders list if new order placed
          setOrders((prev) => {
            const map = new Map(prev.map((o) => [o.id, o]));
            for (const lo of liveOrders) {
              map.set(lo.id, lo);
            }
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        } catch {}
      });
    } catch {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [restaurantSlug]);

  const handleLogout = async () => {
    await fetch(`/api/restaurant/${restaurantSlug}/auth`, { method: 'DELETE' });
    router.push(`/admin/${restaurantSlug}/login`);
  };

  // Order status actions
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/restaurant/${restaurantSlug}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        // Refresh metrics
        const resMetrics = await fetch(`/api/restaurant/${restaurantSlug}/analytics`);
        if (resMetrics.ok) setMetrics(await resMetrics.json());
      }
    } catch (e) {
      console.error('Status update failed', e);
    }
  };

  const handleMarkPaid = async (orderId: string) => {
    try {
      const res = await fetch(`/api/restaurant/${restaurantSlug}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'PAID_AT_COUNTER' }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: 'PAID_AT_COUNTER' } : o))
        );
      }
    } catch (e) {
      console.error('Mark paid failed', e);
    }
  };

  // Toggle Table QR active/inactive
  const handleToggleQR = async (tableId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/restaurant/${restaurantSlug}/tables/${tableId}/qr`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === tableId ? { ...t, qrCode: { ...t.qrCode, isActive: !currentStatus } } : t
          )
        );
      }
    } catch (e) {
      console.error('Failed to toggle QR', e);
    }
  };

  // View QR Modal
  const handleViewQR = async (table: any) => {
    setSelectedQRTable(table);
    try {
      const res = await fetch(`/api/restaurant/${restaurantSlug}/tables/${table.slug}/qr`);
      if (res.ok) {
        const data = await res.json();
        setQrModalDataUrl(data.dataUrl);
      }
    } catch (e) {
      console.error('Failed to fetch QR image', e);
    }
  };

  // Create Table
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;

    try {
      const res = await fetch(`/api/restaurant/${restaurantSlug}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: newTableNumber.trim(),
          capacity: newTableCapacity,
          location: newTableLocation,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setTables((prev) => [...prev, created]);
        setNewTableModal(false);
        setNewTableNumber('');
      }
    } catch (e) {
      console.error('Failed to create table', e);
    }
  };

  // Toggle Food Item Availability
  const handleToggleItemAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/restaurant/${restaurantSlug}/menu/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, isAvailable: !currentStatus }),
      });

      if (res.ok) {
        setMenuCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            foodItems: cat.foodItems.map((fi: any) =>
              fi.id === itemId ? { ...fi, isAvailable: !currentStatus } : fi
            ),
          }))
        );
      }
    } catch (e) {
      console.error('Failed to toggle availability', e);
    }
  };

  // Open modal to add new dish
  const handleOpenAddFood = () => {
    setEditingFoodItemId(null);
    if (menuCategories.length > 0) {
      setFoodCategoryId(menuCategories[0].id);
    }
    setFoodName('');
    setFoodPrice('');
    setFoodPrepTime('15');
    setFoodDescription('');
    setFoodIsVeg(true);
    setFoodIsSpicy(false);
    setFoodIsBestseller(false);
    setFoodImageUrl('');
    setConfirmDeleteItemId(null);
    setFoodModalOpen(true);
  };

  // Open modal to EDIT existing dish
  const handleOpenEditFood = (item: any) => {
    setEditingFoodItemId(item.id);
    setFoodCategoryId(item.categoryId);
    setFoodName(item.name);
    setFoodPrice(item.price.toString());
    setFoodPrepTime((item.preparationTime || 15).toString());
    setFoodDescription(item.description || '');
    setFoodIsVeg(item.isVeg ?? true);
    setFoodIsSpicy(item.isSpicy ?? false);
    setFoodIsBestseller(item.isBestseller ?? false);
    setFoodImageUrl(item.imageUrl || '');
    setConfirmDeleteItemId(null);
    setFoodModalOpen(true);
  };

  // Save or Update Food Item (Server-side persistence)
  const handleSaveFoodItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || !foodPrice) return;

    try {
      const slug = foodName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const payload: any = {
        categoryId: foodCategoryId,
        name: foodName.trim(),
        slug,
        price: parseFloat(foodPrice),
        preparationTime: parseInt(foodPrepTime, 10) || 15,
        description: foodDescription.trim() || undefined,
        isVeg: foodIsVeg,
        isSpicy: foodIsSpicy,
        isBestseller: foodIsBestseller,
        imageUrl: foodImageUrl || undefined,
        isAvailable: true,
      };

      if (editingFoodItemId) {
        payload.id = editingFoodItemId;
      }

      const res = await fetch(`/api/restaurant/${restaurantSlug}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFoodModalOpen(false);
        // Reload menu
        const resMenu = await fetch(`/api/restaurant/${restaurantSlug}/menu?admin=true`);
        if (resMenu.ok) setMenuCategories(await resMenu.json());
      }
    } catch (e) {
      console.error('Failed to save food item', e);
    }
  };

  // Delete Food Item
  const handleDeleteFoodItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/restaurant/${restaurantSlug}/menu?itemId=${itemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setFoodModalOpen(false);
        setConfirmDeleteItemId(null);
        // Reload menu
        const resMenu = await fetch(`/api/restaurant/${restaurantSlug}/menu?admin=true`);
        if (resMenu.ok) setMenuCategories(await resMenu.json());
      }
    } catch (e) {
      console.error('Failed to delete food item', e);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const socialLinks: any[] = [];
      if (settingsForm.instagramUrl) {
        socialLinks.push({ platform: 'instagram', url: settingsForm.instagramUrl, label: 'Instagram' });
      }
      if (settingsForm.facebookUrl) {
        socialLinks.push({ platform: 'facebook', url: settingsForm.facebookUrl, label: 'Facebook' });
      }
      if (settingsForm.whatsappUrl) {
        socialLinks.push({ platform: 'whatsapp', url: settingsForm.whatsappUrl, label: 'WhatsApp' });
      }
      if (settingsForm.mapsUrl || settingsForm.googleMapsUrl) {
        socialLinks.push({ platform: 'maps', url: settingsForm.mapsUrl || settingsForm.googleMapsUrl, label: 'Locate Us' });
      }
      if (settingsForm.youtubeUrl) {
        socialLinks.push({ platform: 'youtube', url: settingsForm.youtubeUrl, label: 'YouTube' });
      }
      if (settingsForm.twitterUrl) {
        socialLinks.push({ platform: 'x', url: settingsForm.twitterUrl, label: 'X (Twitter)' });
      }

      const payload = {
        ...settingsForm,
        taxPercentage: parseFloat(settingsForm.taxPercentage) || 0,
        serviceChargePercentage: parseFloat(settingsForm.serviceChargePercentage) || 0,
        socialLinks,
      };

      const res = await fetch(`/api/restaurant/${restaurantSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setRestaurant(updated);
        setSettingsSavedNotice(true);
        setTimeout(() => setSettingsSavedNotice(false), 3000);
      }
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkSurface-bg flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-zinc-400">Loading Manager Dashboard...</p>
      </div>
    );
  }

  // Filter orders
  const displayedOrders = orders.filter((o) => {
    if (orderStatusFilter === 'ALL') return true;
    return o.status === orderStatusFilter;
  });

  return (
    <div className="min-h-screen bg-darkSurface-bg flex flex-col text-zinc-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 w-full glass-nav border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-amberGold p-[2px] shadow-glow">
              <div className="w-full h-full rounded-[10px] bg-darkSurface-card flex items-center justify-center font-display font-black text-sm text-brand-400">
                OS
              </div>
            </div>
            <div>
              <span className="font-display font-bold text-base text-white">
                {restaurant?.name} Admin
              </span>
              <p className="text-[10px] text-zinc-400">
                Operating System • Multi-Tenant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/r/${restaurantSlug}`}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs border border-zinc-800 transition-colors"
            >
              <span>Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={loadAllData}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'DASHBOARD'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`relative px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'ORDERS'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            Live Orders
            {metrics?.pendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {metrics.pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('TABLES_QR')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'TABLES_QR'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Tables & QR
          </button>

          <button
            onClick={() => setActiveTab('MENU_CMS')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'MENU_CMS'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Menu CMS
          </button>

          <button
            onClick={() => setActiveTab('RESERVATIONS')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'RESERVATIONS'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Reservations
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'SETTINGS'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'DASHBOARD' && metrics && (
          <div className="space-y-8 animate-fade-in">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="p-4 rounded-2xl bg-darkSurface-card border border-darkSurface-border">
                <span className="text-[11px] font-medium text-zinc-400">Today's Revenue</span>
                <p className="font-display font-extrabold text-2xl text-white mt-1">
                  ₹{metrics.todayRevenue}
                </p>
                <span className="text-[10px] text-emerald-400 font-medium">Counter Settled</span>
              </div>

              <div className="p-4 rounded-2xl bg-darkSurface-card border border-darkSurface-border">
                <span className="text-[11px] font-medium text-zinc-400">Today's Orders</span>
                <p className="font-display font-extrabold text-2xl text-white mt-1">
                  {metrics.todayOrdersCount}
                </p>
                <span className="text-[10px] text-zinc-500">
                  {metrics.dineInCount} Dine-in • {metrics.takeawayCount} Takeaway
                </span>
              </div>

              <div className={`p-4 rounded-2xl bg-darkSurface-card border ${metrics.pendingCount > 0 ? 'border-rose-500/50 bg-rose-500/5' : 'border-darkSurface-border'}`}>
                <span className="text-[11px] font-medium text-zinc-400">Pending Approval</span>
                <p className={`font-display font-extrabold text-2xl mt-1 ${metrics.pendingCount > 0 ? 'text-rose-400' : 'text-white'}`}>
                  {metrics.pendingCount}
                </p>
                <span className="text-[10px] text-zinc-500">Action Required</span>
              </div>

              <div className="p-4 rounded-2xl bg-darkSurface-card border border-darkSurface-border">
                <span className="text-[11px] font-medium text-zinc-400">In Preparation</span>
                <p className="font-display font-extrabold text-2xl text-amberGold mt-1">
                  {metrics.preparingCount}
                </p>
                <span className="text-[10px] text-zinc-500">Kitchen Active</span>
              </div>

              <div className="p-4 rounded-2xl bg-darkSurface-card border border-darkSurface-border">
                <span className="text-[11px] font-medium text-zinc-400">Tables Occupied</span>
                <p className="font-display font-extrabold text-2xl text-white mt-1">
                  {metrics.occupiedTables} / {metrics.totalTables}
                </p>
                <span className="text-[10px] text-zinc-500">{metrics.availableTables} Available</span>
              </div>

              <div className="p-4 rounded-2xl bg-darkSurface-card border border-darkSurface-border">
                <span className="text-[11px] font-medium text-zinc-400">Reservations</span>
                <p className="font-display font-extrabold text-2xl text-white mt-1">
                  {metrics.activeReservationsCount}
                </p>
                <span className="text-[10px] text-zinc-500">Scheduled Today</span>
              </div>
            </div>

            {/* Popular Items & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Popular Items */}
              <div className="lg:col-span-5 p-5 rounded-3xl bg-darkSurface-card border border-darkSurface-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-400" />
                    Top Selling Dishes
                  </h3>
                  <span className="text-[11px] text-zinc-500">All-time</span>
                </div>

                <div className="space-y-2.5">
                  {metrics.popularItems?.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-6">No sales recorded yet.</p>
                  ) : (
                    metrics.popularItems.map((item: any, i: number) => (
                      <div
                        key={item.name}
                        className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-bold text-[10px] flex items-center justify-center">
                            #{i + 1}
                          </span>
                          <span className="font-medium text-zinc-100">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-white">₹{item.totalSales}</span>
                          <p className="text-[10px] text-zinc-500">{item.totalQuantity} ordered</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Orders Activity */}
              <div className="lg:col-span-7 p-5 rounded-3xl bg-darkSurface-card border border-darkSurface-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-400" />
                    Recent Live Activity
                  </h3>
                  <button
                    onClick={() => setActiveTab('ORDERS')}
                    className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {metrics.recentOrders?.map((ord: any) => (
                    <div
                      key={ord.id}
                      className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-white">{ord.orderNumber}</strong>
                          <span className="text-zinc-400">
                            ({ord.orderType === 'DINE_IN' ? `Table ${ord.table?.tableNumber || ''}` : 'Takeaway'})
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300">
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {ord.customerName} • {ord.orderItems?.length} items
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-brand-400">₹{ord.totalAmount}</span>
                        <p className="text-[10px] text-zinc-500">
                          {ord.paymentStatus === 'PAID_AT_COUNTER' ? 'Paid ✓' : 'Unpaid'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE ORDERS (Kitchen & Operations) */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-6 animate-fade-in">
            {/* Status Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {['ALL', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setOrderStatusFilter(s)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    orderStatusFilter === s
                      ? 'bg-brand-600 text-white shadow-glow'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {displayedOrders.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-zinc-900/40 border border-zinc-800 text-zinc-400 text-xs">
                No orders match the current filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className={`p-5 rounded-3xl bg-darkSurface-card border flex flex-col justify-between shadow-xl space-y-4 ${
                      ord.status === 'PENDING'
                        ? 'border-brand-500 shadow-glow'
                        : ord.status === 'READY'
                        ? 'border-emerald-500/50'
                        : 'border-darkSurface-border'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-bold text-lg text-white">
                              {ord.orderNumber}
                            </h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                ord.status === 'PENDING'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                                  : ord.status === 'ACCEPTED'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : ord.status === 'PREPARING'
                                  ? 'bg-amberGold/20 text-amberGold'
                                  : ord.status === 'READY'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">
                            <strong>{ord.customerName}</strong> ({ord.customerPhone})
                          </p>
                        </div>

                        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-brand-300 font-semibold">
                          {ord.orderType === 'DINE_IN' ? `Table ${ord.table?.tableNumber || ''}` : 'Takeaway'}
                        </span>
                      </div>

                      {/* Items list */}
                      <div className="mt-4 pt-3 border-t border-zinc-800 space-y-2 text-xs">
                        {ord.orderItems?.map((oi: any) => (
                          <div key={oi.id} className="flex justify-between items-start text-zinc-300">
                            <div>
                              <span>
                                {oi.nameSnapshot} <strong>×{oi.quantity}</strong>
                              </span>
                              {oi.customizations && (
                                <p className="text-[10px] text-zinc-500">
                                  {JSON.parse(oi.customizations).map((c: any) => c.name).join(', ')}
                                </p>
                              )}
                              {oi.specialInstructions && (
                                <p className="text-[10px] text-brand-400 italic">
                                  "{oi.specialInstructions}"
                                </p>
                              )}
                            </div>
                            <span className="font-mono text-white">₹{oi.subtotal}</span>
                          </div>
                        ))}
                      </div>

                      {ord.specialInstructions && (
                        <div className="mt-3 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-amberGold">
                          Note: {ord.specialInstructions}
                        </div>
                      )}

                      {/* Financial info */}
                      <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Total Bill</span>
                        <div className="text-right">
                          <span className="font-display font-extrabold text-base text-white">
                            ₹{ord.totalAmount}
                          </span>
                          <p className="text-[10px]">
                            {ord.paymentStatus === 'PAID_AT_COUNTER' ? (
                              <span className="text-emerald-400 font-bold">PAID AT COUNTER ✓</span>
                            ) : (
                              <span className="text-amberGold font-medium">UNPAID (Pending Counter)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Fast Status Action Buttons (Section 25, 71) */}
                    <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                      {ord.status === 'PENDING' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'ACCEPTED')}
                            className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
                          >
                            Accept Order
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'CANCELLED')}
                            className="py-2.5 rounded-xl bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white font-semibold text-xs transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {ord.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'PREPARING')}
                          className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all"
                        >
                          Start Kitchen Preparation →
                        </button>
                      )}

                      {ord.status === 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'READY')}
                          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all"
                        >
                          Mark Ready to Serve / Pickup ✓
                        </button>
                      )}

                      {ord.status === 'READY' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'COMPLETED')}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all"
                        >
                          Complete Order
                        </button>
                      )}

                      {/* Payment Toggle */}
                      {ord.paymentStatus !== 'PAID_AT_COUNTER' && ord.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleMarkPaid(ord.id)}
                          className="w-full py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 text-[11px] font-semibold border border-zinc-800 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          Mark Paid at Counter
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TABLES & QR MANAGEMENT (Section 41, 72) */}
        {activeTab === 'TABLES_QR' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl text-white">
                  Table & QR Management
                </h2>
                <p className="text-xs text-zinc-400">
                  Persistent table QR codes point dynamically to <code className="text-brand-300">/r/{restaurantSlug}/table/[slug]</code>
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsPrintMode(true)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-800 flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4 text-brand-400" />
                  Print QR Sheets
                </button>

                <button
                  onClick={() => setNewTableModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Table
                </button>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tables.map((t) => {
                const isActive = t.qrCode?.isActive ?? true;

                return (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl bg-darkSurface-card border border-darkSurface-border shadow-md space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-display font-extrabold text-lg text-white">
                          {t.tableNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.status === 'OCCUPIED'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 mt-1">
                        {t.location} • Capacity: <strong>{t.capacity} Guests</strong>
                      </p>

                      <div className="mt-3 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between text-xs">
                        <span className="text-zinc-400">QR Status</span>
                        <span
                          className={`font-semibold ${
                            isActive ? 'text-emerald-400' : 'text-zinc-500'
                          }`}
                        >
                          {isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleViewQR(t)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-200 border border-zinc-800 flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-400" />
                        View QR
                      </button>

                      <button
                        onClick={() => handleToggleQR(t.id, isActive)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                            : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                        }`}
                      >
                        {isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: MENU CMS */}
        {activeTab === 'MENU_CMS' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-xl text-white">
                  Menu & Food Items CMS
                </h2>
                <p className="text-xs text-zinc-400">
                  Update item availability, pricing, and category structures in real-time.
                </p>
              </div>

              <button
                onClick={handleOpenAddFood}
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Food Item
              </button>
            </div>

            {/* Categories & Dishes */}
            <div className="space-y-8">
              {menuCategories.map((cat) => (
                <div key={cat.id} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h3 className="font-display font-bold text-base text-zinc-200">
                      {cat.name} ({cat.foodItems.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {cat.foodItems.map((fi: any) => (
                      <div
                        key={fi.id}
                        className={`p-4 rounded-2xl bg-darkSurface-card border flex flex-col justify-between gap-3 ${
                          fi.isAvailable ? 'border-darkSurface-border shadow-sm' : 'border-zinc-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Dish Image Thumbnail */}
                          <div className="w-16 h-14 sm:w-18 sm:h-16 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {fi.imageUrl ? (
                              <img
                                src={fi.imageUrl}
                                alt={fi.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-zinc-600" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  fi.isVeg ? 'bg-emerald-400' : 'bg-rose-400'
                                }`}
                              />
                              <h4 className="font-semibold text-xs sm:text-sm text-white truncate">
                                {fi.name}
                              </h4>
                              {fi.isBestseller && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Bestseller
                                </span>
                              )}
                              {fi.isSpicy && (
                                <span className="text-[10px]">🌶️</span>
                              )}
                            </div>

                            <span className="font-display font-bold text-xs text-brand-400 mt-0.5 block">
                              ₹{fi.price} • {fi.preparationTime} mins
                            </span>

                            {fi.description && (
                              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                                {fi.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions: Edit dish + Availability Toggle */}
                        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditFood(fi)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-brand-600 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-zinc-700/80 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-brand-400" />
                            <span>Edit Dish</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleItemAvailability(fi.id, fi.isAvailable)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              fi.isAvailable
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                            }`}
                          >
                            {fi.isAvailable ? 'Available ✓' : 'Sold Out ✕'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: RESERVATIONS */}
        {activeTab === 'RESERVATIONS' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display font-bold text-xl text-white">
                Table Reservations
              </h2>
              <p className="text-xs text-zinc-400">
                Manage confirmed bookings, record arrivals, and prevent table clashes.
              </p>
            </div>

            {reservations.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-zinc-900/40 border border-zinc-800 text-zinc-400 text-xs">
                No active reservations recorded.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reservations.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 rounded-2xl bg-darkSurface-card border border-darkSurface-border shadow-md space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display font-bold text-base text-white">
                          {r.customerName}
                        </h3>
                        <p className="text-xs text-zinc-400">
                          {r.customerPhone} {r.customerEmail ? `• ${r.customerEmail}` : ''}
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/30">
                        {r.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-1 text-xs text-zinc-300">
                      <p>
                        Table: <strong className="text-white">{r.table?.tableNumber}</strong> ({r.table?.location})
                      </p>
                      <p>
                        Date & Time: <strong className="text-white">{r.reservationDate} at {r.startTime}</strong>
                      </p>
                      <p>Guest Count: <strong>{r.guestCount} People</strong></p>
                      {r.specialRequest && (
                        <p className="text-[11px] text-amberGold italic mt-1">
                          Request: "{r.specialRequest}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SETTINGS & WEBSITE CMS */}
        {activeTab === 'SETTINGS' && settingsForm && (
          <div className="max-w-4xl space-y-8 animate-fade-in pb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/30 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amberGold" />
                <span>Zero-Code Website CMS & Live Customizer</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-white">
                Live Website Customizer & Controls
              </h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                Edit any piece of content across the entire website—from hero headlines and banner photos to Our Story, footer text, contact details, and diner policies. Updates reflect instantly for guests without touching code.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-8">
              
              {/* SECTION 1: Brand & Hero Presentation */}
              <div className="p-6 sm:p-7 rounded-3xl bg-darkSurface-card border border-darkSurface-border space-y-5 shadow-card">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold">
                    🎨
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">
                      Brand Identity & Hero Experience
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Configure your cafe's main title, hero statement, banner image, and logo.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Cafe / Restaurant Name</label>
                    <input
                      type="text"
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Tagline / Slogan</label>
                    <input
                      type="text"
                      value={settingsForm.tagline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Hero Main Heading</label>
                  <input
                    type="text"
                    value={settingsForm.heroHeading}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroHeading: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                    placeholder="e.g. Fast Flavors. Biker Energy. Pure Craving."
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Hero Subtitle / Description</label>
                  <textarea
                    value={settingsForm.heroSubtitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500 h-20"
                    placeholder="Order directly from your table with QR, reserve a spot in our courtyard..."
                  />
                </div>

                {/* Hero Banner Image URL & Quick Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300 block">Hero Banner Image URL</label>
                    <button
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, heroImageUrl: '/images/hero-banner.jpg' })}
                      className="text-[11px] text-brand-400 hover:text-brand-300 underline font-medium"
                    >
                      Use High-Res Pit Cafe Feast Banner
                    </button>
                  </div>
                  <input
                    type="text"
                    value={settingsForm.heroImageUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroImageUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500 font-mono text-[11px]"
                    placeholder="/images/hero-banner.jpg or https://..."
                  />
                  {settingsForm.heroImageUrl && (
                    <div className="mt-2 w-full h-32 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 relative">
                      <img src={settingsForm.heroImageUrl} alt="Hero Banner Preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-zinc-300 font-mono">
                        Hero Preview
                      </span>
                    </div>
                  )}
                </div>

                {/* Logo URL */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Logo URL / Image Path</label>
                  <input
                    type="text"
                    value={settingsForm.logoUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500 font-mono text-[11px]"
                    placeholder="https://images.unsplash... or /logo.png"
                  />
                </div>
              </div>

              {/* SECTION 2: Our Story & Heritage Customizer */}
              <div className="p-6 sm:p-7 rounded-3xl bg-darkSurface-card border border-darkSurface-border space-y-5 shadow-card">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
                  <div className="w-8 h-8 rounded-lg bg-amberGold/10 text-amberGold flex items-center justify-center font-bold">
                    📖
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">
                      "Our Story" & Heritage Section
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Craft the story of your cafe, biker culture, and food philosophy displayed on the homepage.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Section Eyebrow / Tag</label>
                    <input
                      type="text"
                      value={settingsForm.aboutHeading}
                      onChange={(e) => setSettingsForm({ ...settingsForm, aboutHeading: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                      placeholder="e.g. Our Story, The Pit Legacy"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-zinc-300 block">Story Feature Image URL</label>
                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, storyImageUrl: '/images/our-story.jpg' })}
                        className="text-[11px] text-brand-400 hover:text-brand-300 underline font-medium"
                      >
                        Use Courtyard Photo
                      </button>
                    </div>
                    <input
                      type="text"
                      value={settingsForm.storyImageUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storyImageUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500 font-mono text-[11px]"
                      placeholder="/images/our-story.jpg or https://..."
                    />
                  </div>
                </div>

                {settingsForm.storyImageUrl && (
                  <div className="w-full h-36 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 relative">
                    <img src={settingsForm.storyImageUrl} alt="Story Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-zinc-300 font-mono">
                      Story Photo Preview
                    </span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Full Story / Narrative Text (Separate paragraphs with double newlines)
                  </label>
                  <textarea
                    value={settingsForm.aboutText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, aboutText: e.target.value })}
                    className="w-full px-3.5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500 h-36 leading-relaxed"
                    placeholder="Tell your cafe's origin story, the thrill of motorcycle rides, premium ingredients, and community hangout vibe..."
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Tip: Writing two paragraphs will automatically format into clean narrative blocks on the homepage.
                  </p>
                </div>
              </div>

              {/* SECTION 3: Footer Details & Diner Policies */}
              <div className="p-6 sm:p-7 rounded-3xl bg-darkSurface-card border border-darkSurface-border space-y-5 shadow-card">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    📜
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">
                      Footer Presentation & Diner Policies
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Customize footer summaries, payment policy statements, and copyright notices.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Footer Brand Summary / Bio</label>
                  <textarea
                    value={settingsForm.description}
                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500 h-20"
                    placeholder="Short summary displayed under your cafe name in the footer..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Policy Badge Title</label>
                    <input
                      type="text"
                      value={settingsForm.policyTitle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, policyTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                      placeholder="e.g. Counter Payment Model"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Custom Footer Copyright Line</label>
                    <input
                      type="text"
                      value={settingsForm.footerCopyright}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerCopyright: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                      placeholder="e.g. © 2026 The Pit Cafe. All rights reserved."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Policy Details & Instructions for Diners</label>
                  <textarea
                    value={settingsForm.policyText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, policyText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500 h-20"
                    placeholder="Explain payment method, freshness pledge, and counter settle process..."
                  />
                </div>
              </div>

              {/* SECTION 4: Location, Contact & Operating Hours */}
              <div className="p-6 sm:p-7 rounded-3xl bg-darkSurface-card border border-darkSurface-border space-y-5 shadow-card">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                    📍
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">
                      Location, Contact & Operating Hours
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Ensure your customers can easily locate, call, and visit your cafe.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Street Address</label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                      placeholder="House 5/114, Sector 16, Rohini"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">City</label>
                    <input
                      type="text"
                      value={settingsForm.city}
                      onChange={(e) => setSettingsForm({ ...settingsForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                      placeholder="New Delhi"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Pincode</label>
                    <input
                      type="text"
                      value={settingsForm.pincode}
                      onChange={(e) => setSettingsForm({ ...settingsForm, pincode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                      placeholder="110089"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                      placeholder="contact@thepitcafe.in"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Opening Hours</label>
                    <input
                      type="text"
                      value={settingsForm.openingHours}
                      onChange={(e) => setSettingsForm({ ...settingsForm, openingHours: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                      placeholder="8:00 AM - 11:00 PM"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Google Maps Link URL</label>
                    <input
                      type="text"
                      value={settingsForm.googleMapsUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, googleMapsUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500 font-mono text-[11px]"
                      placeholder="https://maps.google.com/?q=..."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Social Media Channels */}
              <div className="p-6 sm:p-7 rounded-3xl bg-darkSurface-card border border-darkSurface-border space-y-5 shadow-card">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold">
                    🌐
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">
                      Social Media & Community Channels
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      These links populate the social badges in your footer and customer menus.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Instagram URL</label>
                    <input
                      type="text"
                      value={settingsForm.instagramUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                      placeholder="https://instagram.com/thepitcafe"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Facebook URL</label>
                    <input
                      type="text"
                      value={settingsForm.facebookUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                      placeholder="https://facebook.com/thepitcafe"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">WhatsApp Chat URL / Number</label>
                    <input
                      type="text"
                      value={settingsForm.whatsappUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                      placeholder="https://wa.me/919876543210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">YouTube URL</label>
                    <input
                      type="text"
                      value={settingsForm.youtubeUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, youtubeUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                      placeholder="https://youtube.com/@thepitcafe"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">X / Twitter URL</label>
                    <input
                      type="text"
                      value={settingsForm.twitterUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, twitterUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                      placeholder="https://twitter.com/thepitcafe"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 6: Operational Modes & Financial Rules */}
              <div className="p-6 sm:p-7 rounded-3xl bg-darkSurface-card border border-darkSurface-border space-y-5 shadow-card">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    ⚙️
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">
                      Operations, Taxes & Table Greetings
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Enable or pause ordering channels, configure GST, and customize table QR greetings.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs cursor-pointer hover:border-zinc-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={settingsForm.dineInEnabled}
                      onChange={(e) => setSettingsForm({ ...settingsForm, dineInEnabled: e.target.checked })}
                      className="rounded text-brand-500 focus:ring-brand-500"
                    />
                    <span className="font-medium text-zinc-200">Dine-In QR Ordering</span>
                  </label>

                  <label className="flex items-center gap-2 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs cursor-pointer hover:border-zinc-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={settingsForm.takeawayEnabled}
                      onChange={(e) => setSettingsForm({ ...settingsForm, takeawayEnabled: e.target.checked })}
                      className="rounded text-brand-500 focus:ring-brand-500"
                    />
                    <span className="font-medium text-zinc-200">Takeaway Orders</span>
                  </label>

                  <label className="flex items-center gap-2 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs cursor-pointer hover:border-zinc-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={settingsForm.reservationsEnabled}
                      onChange={(e) => setSettingsForm({ ...settingsForm, reservationsEnabled: e.target.checked })}
                      className="rounded text-brand-500 focus:ring-brand-500"
                    />
                    <span className="font-medium text-zinc-200">Table Reservations</span>
                  </label>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <label className="flex items-center gap-2.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.maintenanceMode}
                      onChange={(e) => setSettingsForm({ ...settingsForm, maintenanceMode: e.target.checked })}
                      className="rounded text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-amberGold font-bold">
                      Emergency Kitchen Pause / Maintenance Mode
                    </span>
                  </label>
                  {settingsForm.maintenanceMode && (
                    <input
                      type="text"
                      value={settingsForm.maintenanceNotice}
                      onChange={(e) => setSettingsForm({ ...settingsForm, maintenanceNotice: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-amber-500/40 text-xs text-white focus:outline-none"
                      placeholder="e.g. Kitchen is running at maximum capacity. We'll reopen orders at 8 PM."
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Tax / GST Percentage (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settingsForm.taxPercentage}
                      onChange={(e) => setSettingsForm({ ...settingsForm, taxPercentage: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">QR Greeting Heading</label>
                    <input
                      type="text"
                      value={settingsForm.welcomeGreetingHeading}
                      onChange={(e) => setSettingsForm({ ...settingsForm, welcomeGreetingHeading: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                      placeholder="Welcome to The Pit Cafe"
                    />
                  </div>
                </div>
              </div>

              {/* Save & Feedback Toolbar */}
              <div className="sticky bottom-6 z-30 p-4 rounded-2xl bg-zinc-900/95 border border-zinc-700/80 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                  {settingsSavedNotice ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                      <Check className="w-4 h-4" />
                      All changes saved and active across the website!
                    </span>
                  ) : (
                    <span className="text-zinc-400">
                      Changes update customer-facing pages, QR codes, and footers in real-time.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="submit"
                    className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:brightness-110 active:scale-95 text-white font-bold text-xs shadow-glow transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save All Changes</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}
      </main>

      {/* QR Modal (View & Download) */}
      {selectedQRTable && qrModalDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="max-w-xs w-full p-6 rounded-3xl bg-darkSurface-card border border-darkSurface-border shadow-2xl text-center space-y-4">
            <h3 className="font-display font-bold text-lg text-white">
              {selectedQRTable.tableNumber} QR Code
            </h3>
            <p className="text-xs text-zinc-400">{selectedQRTable.location}</p>

            <div className="p-4 bg-white rounded-2xl mx-auto inline-block shadow-inner">
              <img src={qrModalDataUrl} alt="Table QR" className="w-48 h-48 mx-auto" />
            </div>

            <p className="text-[10px] text-zinc-500 font-mono">
              /r/{restaurantSlug}/table/{selectedQRTable.slug}
            </p>

            <div className="flex gap-2 pt-2">
              <a
                href={qrModalDataUrl}
                download={`${restaurantSlug}-${selectedQRTable.slug}-qr.png`}
                className="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download PNG
              </a>

              <button
                onClick={() => {
                  setSelectedQRTable(null);
                  setQrModalDataUrl(null);
                }}
                className="py-2 px-3 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable QR Sheet Generator Modal (Section 72) */}
      {isPrintMode && (
        <div className="fixed inset-0 z-50 bg-white text-black p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center no-print border-b pb-4">
              <div>
                <h2 className="text-xl font-bold">Printable QR Code Cards</h2>
                <p className="text-xs text-gray-600">Standard printable table cards for {restaurant?.name}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg"
                >
                  Print Sheet
                </button>
                <button
                  onClick={() => setIsPrintMode(false)}
                  className="px-4 py-2 border border-gray-300 text-xs font-semibold rounded-lg"
                >
                  Exit Print View
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {tables.map((tbl) => (
                <div
                  key={tbl.id}
                  className="border-2 border-dashed border-gray-400 p-8 rounded-2xl text-center space-y-4 break-inside-avoid"
                >
                  <h3 className="font-extrabold text-2xl tracking-wider uppercase">{restaurant?.name}</h3>
                  <div className="inline-block px-4 py-1 rounded-full bg-black text-white text-sm font-bold">
                    {tbl.tableNumber}
                  </div>
                  <div className="w-48 h-48 mx-auto border p-2 rounded-xl flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${restaurantSlug}/table/${tbl.slug}`
                      )}`}
                      alt={tbl.tableNumber}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="font-medium text-sm">Scan to view fresh menu and order from your table</p>
                  <p className="text-[10px] text-gray-500 font-mono">
                    /r/{restaurantSlug}/table/{tbl.slug}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Table Modal */}
      {newTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleCreateTable}
            className="max-w-sm w-full p-6 rounded-3xl bg-darkSurface-card border border-darkSurface-border shadow-2xl space-y-4"
          >
            <h3 className="font-display font-bold text-base text-white">Add New Table</h3>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Table Number</label>
              <input
                type="text"
                placeholder="e.g. Table 07 or T15"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Capacity (Guests)</label>
              <input
                type="number"
                min={1}
                max={20}
                value={newTableCapacity}
                onChange={(e) => setNewTableCapacity(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Location Zone</label>
              <select
                value={newTableLocation}
                onChange={(e) => setNewTableLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="Biker Courtyard">Biker Courtyard</option>
                <option value="Indoor Cozy Booth">Indoor Cozy Booth</option>
                <option value="Outdoor Terrace">Outdoor Terrace</option>
                <option value="Bar Counter">Bar Counter</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs"
              >
                Create Table & QR
              </button>
              <button
                type="button"
                onClick={() => setNewTableModal(false)}
                className="py-2 px-3 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Food Item Modal (Supports both Creating New & Updating Existing Items) */}
      {foodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <form
            onSubmit={handleSaveFoodItem}
            className="max-w-md w-full p-6 rounded-3xl bg-darkSurface-card border border-darkSurface-border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  {editingFoodItemId ? 'Edit Food Item' : 'Add New Dish'}
                </h3>
                <p className="text-[11px] text-zinc-400">
                  {editingFoodItemId ? 'Modify pricing, description, and photo' : 'Add a fresh item to your digital menu'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFoodModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Device Image Upload & Cropper Section */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Dish Image (from Device)
              </label>

              {foodImageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-zinc-700 bg-black aspect-[16/10] max-h-48 group">
                  <img
                    src={foodImageUrl}
                    alt="Dish preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setIsCropperOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1 shadow-lg"
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>Re-Crop / Change</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFoodImageUrl('')}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 shadow-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsCropperOpen(true)}
                  className="border-2 border-dashed border-zinc-700 hover:border-brand-500 rounded-2xl p-4 text-center cursor-pointer bg-zinc-900/60 transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">
                      Upload & Crop Dish Photo from Device
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Select photo, pan, zoom, and crop to card aspect ratio
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-1 px-3 py-1 rounded-lg bg-brand-600 text-white text-xs font-semibold"
                  >
                    Select Photo
                  </button>
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Category</label>
              <select
                value={foodCategoryId}
                onChange={(e) => setFoodCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                required
              >
                {menuCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Dish Name */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Dish Name</label>
              <input
                type="text"
                placeholder="e.g. Crispy Paneer Burger"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            {/* Price & Prep Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Price (₹)</label>
                <input
                  type="number"
                  min={1}
                  placeholder="150"
                  value={foodPrice}
                  onChange={(e) => setFoodPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Prep Time (mins)</label>
                <input
                  type="number"
                  value={foodPrepTime}
                  onChange={(e) => setFoodPrepTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Description</label>
              <textarea
                placeholder="Ingredients, flavors, artisan spices, and pairing tips..."
                value={foodDescription}
                onChange={(e) => setFoodDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand-500 h-20"
              />
            </div>

            {/* Dietary & Badges */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-800">
              <label className="flex items-center gap-1.5 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={foodIsVeg}
                  onChange={(e) => setFoodIsVeg(e.target.checked)}
                  className="rounded text-brand-500 focus:ring-brand-500"
                />
                <span>Pure Veg</span>
              </label>

              <label className="flex items-center gap-1.5 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={foodIsSpicy}
                  onChange={(e) => setFoodIsSpicy(e.target.checked)}
                  className="rounded text-brand-500 focus:ring-brand-500"
                />
                <span>🌶️ Spicy</span>
              </label>

              <label className="flex items-center gap-1.5 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={foodIsBestseller}
                  onChange={(e) => setFoodIsBestseller(e.target.checked)}
                  className="rounded text-brand-500 focus:ring-brand-500"
                />
                <span>⭐ Bestseller</span>
              </label>
            </div>

            {/* Delete button if editing */}
            {editingFoodItemId && (
              <div className="pt-2 border-t border-zinc-800">
                {confirmDeleteItemId === editingFoodItemId ? (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs">
                    <span className="text-rose-400 font-medium">Delete this item permanently?</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteFoodItem(editingFoodItemId)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold"
                      >
                        Yes, Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteItemId(null)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteItemId(editingFoodItemId)}
                    className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Food Item</span>
                  </button>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:brightness-110 text-white font-semibold text-xs shadow-glow transition-all"
              >
                {editingFoodItemId ? 'Save Dish Updates' : 'Add to Menu'}
              </button>
              <button
                type="button"
                onClick={() => setFoodModalOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Image Cropper Modal (Canvas pan & zoom upload from device) */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        onCropComplete={(dataUrl) => setFoodImageUrl(dataUrl)}
      />
    </div>
  );
}
