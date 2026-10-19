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
  Upload,
} from 'lucide-react';
import { ImageCropperModal } from '@/components/ImageCropperModal';
import { PitCafeLogo } from '@/components/PitCafeLogo';

const FALLBACK_ORDERS = [
  {
    id: 'demo-ord-1',
    orderNumber: '#1248',
    customerName: 'Arjun Mehta',
    customerPhone: '+91 98765 43210',
    orderType: 'DINE_IN',
    table: { tableNumber: 'T1', location: 'Courtyard' },
    status: 'PREPARING',
    paymentStatus: 'PAID_AT_COUNTER',
    totalAmount: 760,
    specialInstructions: 'Make it extra spicy, extra garlic dip',
    createdAt: new Date().toISOString(),
    orderItems: [
      { id: 'doi-1', nameSnapshot: 'BBQ Chicken Burger', quantity: 1, subtotal: 280 },
      { id: 'doi-2', nameSnapshot: 'Loaded Fries with Cheddar', quantity: 1, subtotal: 220 },
      { id: 'doi-3', nameSnapshot: 'Classic Café Mocha', quantity: 1, subtotal: 260 },
    ],
  },
  {
    id: 'demo-ord-2',
    orderNumber: '#1247',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98112 34567',
    orderType: 'DINE_IN',
    table: { tableNumber: 'T3', location: 'Courtyard' },
    status: 'READY',
    paymentStatus: 'PAID_AT_COUNTER',
    totalAmount: 540,
    specialInstructions: 'Less ice in beverage',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    orderItems: [
      { id: 'doi-4', nameSnapshot: 'Peri Peri Pasta', quantity: 1, subtotal: 260 },
      { id: 'doi-5', nameSnapshot: 'Belgian Chocolate Thick Shake', quantity: 1, subtotal: 280 },
    ],
  },
  {
    id: 'demo-ord-3',
    orderNumber: '#1246',
    customerName: 'Priya Kapoor',
    customerPhone: '+91 99991 22334',
    orderType: 'DINE_IN',
    table: { tableNumber: 'T4', location: 'Indoor' },
    status: 'PREPARING',
    paymentStatus: 'UNPAID',
    totalAmount: 1120,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    orderItems: [
      { id: 'doi-6', nameSnapshot: 'Pull-Apart Cheesy Garlic Bread', quantity: 2, subtotal: 360 },
      { id: 'doi-7', nameSnapshot: 'Afghani Malai Chaap', quantity: 2, subtotal: 440 },
      { id: 'doi-8', nameSnapshot: 'Hazelnut Iced Cold Coffee', quantity: 2, subtotal: 320 },
    ],
  },
  {
    id: 'demo-ord-4',
    orderNumber: '#1245',
    customerName: 'Sneha Roy',
    customerPhone: '+91 97110 99887',
    orderType: 'TAKEAWAY',
    table: null,
    status: 'COMPLETED',
    paymentStatus: 'PAID_AT_COUNTER',
    totalAmount: 320,
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    orderItems: [
      { id: 'doi-9', nameSnapshot: 'Peri Peri Crispy Fries', quantity: 1, subtotal: 140 },
      { id: 'doi-10', nameSnapshot: 'Classic Thick Cold Coffee', quantity: 1, subtotal: 180 },
    ],
  },
];

const FALLBACK_RESERVATIONS = [
  {
    id: 'demo-res-1',
    customerName: 'Rohit Verma',
    customerPhone: '+91 98765 43210',
    customerEmail: 'rohit@bikerclub.com',
    guestCount: 4,
    reservationDate: new Date().toISOString().split('T')[0],
    startTime: '19:00',
    status: 'CONFIRMED',
    table: { tableNumber: 'T1', location: 'Biker Courtyard' },
    specialRequest: 'Biker club meetup, outdoor table near parking line',
  },
  {
    id: 'demo-res-2',
    customerName: 'Ananya Sharma',
    customerPhone: '+91 98112 34567',
    customerEmail: 'ananya@gmail.com',
    guestCount: 2,
    reservationDate: new Date().toISOString().split('T')[0],
    startTime: '20:30',
    status: 'ARRIVED',
    table: { tableNumber: 'T3', location: 'Biker Courtyard' },
    specialRequest: 'Birthday celebration with garlic bread',
  },
  {
    id: 'demo-res-3',
    customerName: 'Vikram Rajput',
    customerPhone: '+91 99991 22334',
    customerEmail: 'vikram@yahoo.com',
    guestCount: 6,
    reservationDate: new Date().toISOString().split('T')[0],
    startTime: '21:00',
    status: 'CONFIRMED',
    table: { tableNumber: 'T4', location: 'Indoor Lounge' },
    specialRequest: 'Late dinner after long ride',
  },
];

export default function AdminDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantSlug = params.slug as string;

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ORDERS' | 'TABLES_QR' | 'MENU_CMS' | 'RESERVATIONS' | 'CUSTOMERS' | 'ANALYTICS' | 'SETTINGS'>('DASHBOARD');

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

  // Device Image Upload Refs for Settings
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const heroInputRef = React.useRef<HTMLInputElement>(null);
  const storyInputRef = React.useRef<HTMLInputElement>(null);

  const handleDeviceImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'heroImageUrl' | 'storyImageUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1400;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setSettingsForm((prev: any) => ({
            ...prev,
            [field]: compressedDataUrl,
          }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateTestOrder = async () => {
    try {
      const sampleItem = menuCategories[0]?.foodItems[0] || {
        id: 'sample-monster-burger',
        name: 'The Pit Monster Biker Burger',
        price: 220,
      };
      const res = await fetch(`/api/restaurant/${restaurantSlug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderType: 'DINE_IN',
          tableId: tables[0]?.id,
          customerName: 'Aman Sharma',
          customerPhone: '+91 98765 43210',
          specialInstructions: 'Extra cheese pull, bike parked outside table 1',
          items: [
            {
              foodItemId: sampleItem.id,
              quantity: 2,
              customizations: [],
            },
          ],
        }),
      });
      if (res.ok) {
        await loadAllData();
      }
    } catch (e) {
      console.error('Failed to create test order', e);
    }
  };

  const handleCreateTestReservation = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/restaurant/${restaurantSlug}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: tables[0]?.id,
          customerName: 'Rohit Verma',
          customerPhone: '+91 98112 34567',
          customerEmail: 'rohit@bikerclub.com',
          guestCount: 4,
          reservationDate: today,
          startTime: '20:00',
          specialRequest: 'Outdoor biker courtyard table with view of ride',
        }),
      });
      if (res.ok) {
        await loadAllData();
      }
    } catch (e) {
      console.error('Failed to create test reservation', e);
    }
  };

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

  // Filter orders with fallback so Vercel deployment is never empty
  const isDemoOrders = orders.length === 0;
  const effectiveOrders = isDemoOrders ? FALLBACK_ORDERS : orders;
  const displayedOrders = effectiveOrders.filter((o) => {
    if (orderStatusFilter === 'ALL') return true;
    return o.status === orderStatusFilter;
  });

  const isDemoReservations = reservations.length === 0;
  const effectiveReservations = isDemoReservations ? FALLBACK_RESERVATIONS : reservations;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex text-zinc-900 font-sans">
      {/* Left Dark Sidebar matching Screen 6 */}
      <aside className="w-64 bg-[#111217] text-white flex-shrink-0 hidden md:flex flex-col justify-between p-5 border-r border-zinc-800 sticky top-0 h-screen overflow-y-auto">
        <div>
          {/* Logo & Brand matching Screen 6 */}
          <div className="px-2 py-3 mb-6 border-b border-zinc-800/80">
            <PitCafeLogo size="sm" showSubtitle={true} href={`/admin/${restaurantSlug}`} />
          </div>

          {/* Sidebar Navigation */}
          <nav className="space-y-1.5 text-xs font-semibold">
            {/* Dashboard */}
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'DASHBOARD'
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* Orders */}
            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'ORDERS'
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="w-4 h-4" />
                <span>Orders</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                {orders.length > 0 ? orders.length : 12}
              </span>
            </button>

            {/* Menu Management */}
            <button
              onClick={() => setActiveTab('MENU_CMS')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'MENU_CMS'
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Menu Management</span>
            </button>

            {/* Table Management */}
            <button
              onClick={() => setActiveTab('TABLES_QR')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'TABLES_QR'
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Table Management</span>
            </button>

            {/* Reservations */}
            <button
              onClick={() => setActiveTab('RESERVATIONS')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'RESERVATIONS'
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <span>Reservations</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                {reservations.length > 0 ? reservations.length : 3}
              </span>
            </button>

            {/* Customers */}
            <button
              onClick={() => setActiveTab('CUSTOMERS')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'CUSTOMERS'
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customers</span>
            </button>

            {/* Analytics */}
            <button
              onClick={() => setActiveTab('ANALYTICS')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'ANALYTICS'
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setActiveTab('SETTINGS')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'SETTINGS'
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Logout */}
        <div className="pt-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Right Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header matching Screen 6 */}
        <header className="px-6 py-4 bg-white border-b border-zinc-200 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-zinc-900">
              {activeTab === 'DASHBOARD'
                ? 'Dashboard'
                : activeTab === 'ORDERS'
                ? 'Live Orders'
                : activeTab === 'MENU_CMS'
                ? 'Menu Management'
                : activeTab === 'TABLES_QR'
                ? 'Table Management'
                : activeTab === 'RESERVATIONS'
                ? 'Reservations'
                : activeTab === 'CUSTOMERS'
                ? 'Customers'
                : activeTab === 'ANALYTICS'
                ? 'Analytics'
                : 'Settings'}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Here&apos;s what&apos;s happening at The Pit Cafe today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/r/${restaurantSlug}`}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium border border-zinc-200 transition-colors"
            >
              <span>Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={loadAllData}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border border-zinc-200 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Date Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-medium text-zinc-700 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>Mon, 16 Dec 2024</span>
            </div>

            {/* Admin Avatar Profile */}
            <div className="flex items-center gap-2.5 pl-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Admin"
                className="w-8 h-8 rounded-full object-cover border border-zinc-300 shadow-sm"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-zinc-900 leading-none">Admin</p>
                <p className="text-[10px] text-zinc-500 leading-none mt-0.5">The Pit Cafe</p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Pills */}
        <div className="md:hidden flex items-center gap-1.5 px-4 py-2.5 bg-[#111217] overflow-x-auto text-xs no-scrollbar">
          {(['DASHBOARD', 'ORDERS', 'MENU_CMS', 'TABLES_QR', 'RESERVATIONS', 'CUSTOMERS', 'ANALYTICS', 'SETTINGS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Canvas Body */}
        <main className="p-5 sm:p-8 flex-1 overflow-y-auto">
          {/* TAB 1: DASHBOARD (Screen 6) */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto">
              
              {/* Row 1: 4 KPI Cards matching Screen 6 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                
                {/* KPI 1: Total Orders */}
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-500">Total Orders</span>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-2xl text-zinc-900">
                        {metrics?.todayOrdersCount ? metrics.todayOrdersCount : 24}
                      </span>
                      <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        + 12%
                      </span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>

                {/* KPI 2: Total Revenue */}
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-500">Total Revenue</span>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-2xl text-zinc-900">
                        ₹ {metrics?.todayRevenue ? metrics.todayRevenue.toLocaleString() : '12,480'}
                      </span>
                      <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        + 8%
                      </span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

                {/* KPI 3: Active Tables */}
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-500">Active Tables</span>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-2xl text-zinc-900">
                        {metrics ? `${metrics.occupiedTables || 8}/${metrics.totalTables || 12}` : '8/12'}
                      </span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                {/* KPI 4: Reservations */}
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-500">Reservations</span>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-2xl text-zinc-900">
                        {metrics?.activeReservationsCount ? metrics.activeReservationsCount : 5}
                      </span>
                      <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        + 25%
                      </span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

              </div>

              {/* Row 2: Charts (Sales Overview & Order Status) matching Screen 6 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Card: Sales Overview (Line Chart) */}
                <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-zinc-900">
                      Sales Overview
                    </h3>
                    <div className="px-2.5 py-1 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 flex items-center gap-1 cursor-pointer">
                      <span>Today</span>
                      <span className="text-[10px]">▼</span>
                    </div>
                  </div>

                  {/* SVG Line Chart with Crimson Red Curve and Area Gradient Fill */}
                  <div className="relative w-full h-56 pt-2">
                    <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#DC2626" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#DC2626" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      <line x1="40" y1="30" x2="580" y2="30" stroke="#E4E4E7" strokeDasharray="4 4" />
                      <line x1="40" y1="80" x2="580" y2="80" stroke="#E4E4E7" strokeDasharray="4 4" />
                      <line x1="40" y1="130" x2="580" y2="130" stroke="#E4E4E7" strokeDasharray="4 4" />
                      <line x1="40" y1="180" x2="580" y2="180" stroke="#E4E4E7" strokeDasharray="4 4" />

                      {/* Y-axis values */}
                      <text x="25" y="34" fontSize="10" fill="#A1A1AA" textAnchor="end">50</text>
                      <text x="25" y="84" fontSize="10" fill="#A1A1AA" textAnchor="end">35</text>
                      <text x="25" y="134" fontSize="10" fill="#A1A1AA" textAnchor="end">20</text>
                      <text x="25" y="184" fontSize="10" fill="#A1A1AA" textAnchor="end">0</text>

                      {/* Area gradient fill under curve */}
                      <path
                        d="M 50 170 C 130 160, 180 150, 240 100 C 300 50, 360 120, 420 80 C 480 40, 520 60, 570 50 L 570 180 L 50 180 Z"
                        fill="url(#salesGrad)"
                      />

                      {/* Main Crimson Curve */}
                      <path
                        d="M 50 170 C 130 160, 180 150, 240 100 C 300 50, 360 120, 420 80 C 480 40, 520 60, 570 50"
                        fill="none"
                        stroke="#DC2626"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Highlight Data Points */}
                      <circle cx="240" cy="100" r="4.5" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
                      <circle cx="420" cy="80" r="4.5" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
                      <circle cx="570" cy="50" r="4.5" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
                    </svg>

                    {/* X-axis labels */}
                    <div className="flex justify-between pl-8 pr-2 pt-2 text-[11px] font-medium text-zinc-400">
                      <span>8 AM</span>
                      <span>12 PM</span>
                      <span>4 PM</span>
                      <span>8 PM</span>
                      <span>12 AM</span>
                    </div>
                  </div>
                </div>

                {/* Right Card: Order Status (Donut Chart) */}
                <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-zinc-900">
                      Order Status
                    </h3>
                    <div className="px-2.5 py-1 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 flex items-center gap-1 cursor-pointer">
                      <span>Today</span>
                      <span className="text-[10px]">▼</span>
                    </div>
                  </div>

                  {/* Donut Chart + Legend */}
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
                    {/* SVG Donut */}
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background ring */}
                        <circle cx="50" cy="50" r="38" stroke="#F4F4F5" strokeWidth="11" fill="none" />
                        {/* Delivered (12/24 = 50%) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          stroke="#10B981"
                          strokeWidth="11"
                          strokeDasharray="119.38 238.76"
                          strokeDashoffset="0"
                          fill="none"
                        />
                        {/* Preparing (6/24 = 25%) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          stroke="#F59E0B"
                          strokeWidth="11"
                          strokeDasharray="59.69 238.76"
                          strokeDashoffset="-119.38"
                          fill="none"
                        />
                        {/* Pending (4/24 = 16.6%) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          stroke="#3B82F6"
                          strokeWidth="11"
                          strokeDasharray="39.79 238.76"
                          strokeDashoffset="-179.07"
                          fill="none"
                        />
                        {/* Cancelled (2/24 = 8.3%) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          stroke="#EF4444"
                          strokeWidth="11"
                          strokeDasharray="19.89 238.76"
                          strokeDashoffset="-218.86"
                          fill="none"
                        />
                      </svg>
                      {/* Center Stats */}
                      <div className="absolute text-center">
                        <span className="font-display font-black text-2xl text-zinc-900 leading-none block">
                          24
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">Total Orders</span>
                      </div>
                    </div>

                    {/* Breakdown Legend */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-zinc-600">Delivered</span>
                        </div>
                        <span className="font-bold text-zinc-900">12</span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span className="text-zinc-600">Preparing</span>
                        </div>
                        <span className="font-bold text-zinc-900">6</span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          <span className="text-zinc-600">Pending</span>
                        </div>
                        <span className="font-bold text-zinc-900">4</span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <span className="text-zinc-600">Cancelled</span>
                        </div>
                        <span className="font-bold text-zinc-900">2</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Row 3: Recent Orders & Table Status matching Screen 6 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Card: Recent Orders Table */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-zinc-900">
                      Recent Orders
                    </h3>
                    <button
                      onClick={() => setActiveTab('ORDERS')}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      View All →
                    </button>
                  </div>

                  {/* Clean Order Rows Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 text-zinc-400 font-semibold">
                          <th className="pb-3 font-medium">#</th>
                          <th className="pb-3 font-medium">Customer</th>
                          <th className="pb-3 font-medium">Items</th>
                          <th className="pb-3 font-medium">Total</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {orders.length > 0 ? (
                          orders.slice(0, 5).map((ord) => (
                            <tr key={ord.id} className="hover:bg-zinc-50 transition-colors">
                              <td className="py-3 font-bold text-zinc-900">{ord.orderNumber}</td>
                              <td className="py-3 text-zinc-700 font-medium">{ord.customerName}</td>
                              <td className="py-3 text-zinc-600">{ord.orderItems?.length || 1}</td>
                              <td className="py-3 font-bold text-zinc-900">₹ {ord.totalAmount}</td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    ord.status === 'PREPARING'
                                      ? 'bg-amber-50 text-amber-600'
                                      : ord.status === 'READY' || ord.status === 'COMPLETED'
                                      ? 'bg-emerald-50 text-emerald-600'
                                      : 'bg-zinc-100 text-zinc-600'
                                  }`}
                                >
                                  {ord.status === 'COMPLETED' ? 'Delivered' : ord.status}
                                </span>
                              </td>
                              <td className="py-3 text-zinc-500 text-right">
                                {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <>
                            <tr className="hover:bg-zinc-50 transition-colors">
                              <td className="py-3 font-bold text-zinc-900">#1248</td>
                              <td className="py-3 text-zinc-700 font-medium">Arjun M.</td>
                              <td className="py-3 text-zinc-600">3</td>
                              <td className="py-3 font-bold text-zinc-900">₹ 760</td>
                              <td className="py-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600">
                                  Preparing
                                </span>
                              </td>
                              <td className="py-3 text-zinc-500 text-right">2:14 PM</td>
                            </tr>
                            <tr className="hover:bg-zinc-50 transition-colors">
                              <td className="py-3 font-bold text-zinc-900">#1247</td>
                              <td className="py-3 text-zinc-700 font-medium">Rahul S.</td>
                              <td className="py-3 text-zinc-600">2</td>
                              <td className="py-3 font-bold text-zinc-900">₹ 540</td>
                              <td className="py-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                                  Delivered
                                </span>
                              </td>
                              <td className="py-3 text-zinc-500 text-right">2:02 PM</td>
                            </tr>
                            <tr className="hover:bg-zinc-50 transition-colors">
                              <td className="py-3 font-bold text-zinc-900">#1246</td>
                              <td className="py-3 text-zinc-700 font-medium">Priya K.</td>
                              <td className="py-3 text-zinc-600">4</td>
                              <td className="py-3 font-bold text-zinc-900">₹ 1,120</td>
                              <td className="py-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600">
                                  Preparing
                                </span>
                              </td>
                              <td className="py-3 text-zinc-500 text-right">1:48 PM</td>
                            </tr>
                            <tr className="hover:bg-zinc-50 transition-colors">
                              <td className="py-3 font-bold text-zinc-900">#1245</td>
                              <td className="py-3 text-zinc-700 font-medium">Sneha R.</td>
                              <td className="py-3 text-zinc-600">1</td>
                              <td className="py-3 font-bold text-zinc-900">₹ 320</td>
                              <td className="py-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                                  Delivered
                                </span>
                              </td>
                              <td className="py-3 text-zinc-500 text-right">1:22 PM</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Card: Table Status matching Screen 6 */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-zinc-900">
                      Table Status
                    </h3>
                    <div className="px-2.5 py-1 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 flex items-center gap-1 cursor-pointer">
                      <span>View Layout</span>
                      <span className="text-[10px]">▼</span>
                    </div>
                  </div>

                  {/* 8 Table Cards Grid matching Screen 6 */}
                  <div className="grid grid-cols-4 gap-2.5">
                    {[
                      { name: 'T1', seats: '4 Seater', status: 'Available', color: 'emerald' },
                      { name: 'T2', seats: '6 Seater', status: 'Occupied', color: 'red' },
                      { name: 'T3', seats: '2 Seater', status: 'Occupied', color: 'red' },
                      { name: 'T4', seats: '4 Seater', status: 'Available', color: 'emerald' },
                      { name: 'T5', seats: '4 Seater', status: 'Reserved', color: 'amber' },
                      { name: 'T6', seats: '2 Seater', status: 'Available', color: 'emerald' },
                      { name: 'T7', seats: '4 Seater', status: 'Available', color: 'emerald' },
                      { name: 'T8', seats: '6 Seater', status: 'Occupied', color: 'red' },
                    ].map((tbl) => (
                      <div
                        key={tbl.name}
                        className="p-2.5 rounded-xl border border-zinc-200 text-center space-y-1 bg-zinc-50/60 hover:bg-zinc-100 transition-colors"
                      >
                        <p className="font-display font-black text-xs text-zinc-900">{tbl.name}</p>
                        <p className="text-[10px] text-zinc-400">{tbl.seats}</p>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            tbl.color === 'emerald'
                              ? 'bg-emerald-50 text-emerald-600'
                              : tbl.color === 'red'
                              ? 'bg-red-50 text-red-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {tbl.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}


        {/* TAB 2: LIVE ORDERS (Kitchen & Operations) */}
        {/* TAB 2: LIVE ORDERS (Kitchen & Operations) */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-6 animate-fade-in">
            {isDemoOrders && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>Vercel Live Preview Active:</strong> Displaying demo orders (0 live database records). Once table QR orders arrive, they appear here live.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCreateTestOrder}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Real Order in DB</span>
                </button>
              </div>
            )}

            {/* Status Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {['ALL', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setOrderStatusFilter(s)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    orderStatusFilter === s
                      ? 'bg-red-600 text-white shadow-sm font-bold'
                      : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {displayedOrders.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-zinc-200 text-zinc-500 text-xs shadow-sm">
                No orders match the current filter "{orderStatusFilter}".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className={`p-5 rounded-2xl bg-white border flex flex-col justify-between shadow-sm space-y-4 ${
                      ord.status === 'PENDING'
                        ? 'border-red-400 ring-2 ring-red-100'
                        : ord.status === 'READY'
                        ? 'border-emerald-400'
                        : 'border-zinc-200'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-bold text-lg text-zinc-900">
                              {ord.orderNumber}
                            </h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                ord.status === 'PENDING'
                                  ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
                                  : ord.status === 'ACCEPTED'
                                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                  : ord.status === 'PREPARING'
                                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                  : ord.status === 'READY'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                  : 'bg-zinc-100 text-zinc-600'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-1">
                            <strong className="text-zinc-800">{ord.customerName}</strong> ({ord.customerPhone})
                          </p>
                        </div>

                        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 font-semibold">
                          {ord.orderType === 'DINE_IN' ? `Table ${ord.table?.tableNumber || ''}` : 'Takeaway'}
                        </span>
                      </div>

                      {/* Items list */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 space-y-2 text-xs">
                        {ord.orderItems?.map((oi: any) => (
                          <div key={oi.id} className="flex justify-between items-start text-zinc-700">
                            <div>
                              <span>
                                {oi.nameSnapshot} <strong className="text-zinc-900">×{oi.quantity}</strong>
                              </span>
                              {oi.customizations && (
                                <p className="text-[10px] text-zinc-400">
                                  {JSON.parse(oi.customizations).map((c: any) => c.name).join(', ')}
                                </p>
                              )}
                              {oi.specialInstructions && (
                                <p className="text-[10px] text-red-600 italic">
                                  "{oi.specialInstructions}"
                                </p>
                              )}
                            </div>
                            <span className="font-mono font-bold text-zinc-900">₹{oi.subtotal}</span>
                          </div>
                        ))}
                      </div>

                      {ord.specialInstructions && (
                        <div className="mt-3 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                          Note: {ord.specialInstructions}
                        </div>
                      )}

                      {/* Financial info */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Total Bill</span>
                        <div className="text-right">
                          <span className="font-display font-black text-base text-zinc-900">
                            ₹{ord.totalAmount}
                          </span>
                          <p className="text-[10px]">
                            {ord.paymentStatus === 'PAID_AT_COUNTER' ? (
                              <span className="text-emerald-600 font-bold">PAID AT COUNTER ✓</span>
                            ) : (
                              <span className="text-amber-600 font-medium">UNPAID (Pending Counter)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Fast Status Action Buttons */}
                    <div className="pt-3 border-t border-zinc-100 space-y-2">
                      {ord.status === 'PENDING' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'ACCEPTED')}
                            className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                          >
                            Accept Order
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'CANCELLED')}
                            className="py-2.5 rounded-xl bg-zinc-100 hover:bg-rose-50 text-zinc-700 hover:text-rose-600 border border-zinc-200 font-semibold text-xs transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {ord.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'PREPARING')}
                          className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-sm"
                        >
                          Start Kitchen Preparation →
                        </button>
                      )}

                      {ord.status === 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'READY')}
                          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm"
                        >
                          Mark Ready to Serve / Pickup ✓
                        </button>
                      )}

                      {ord.status === 'READY' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'COMPLETED')}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm"
                        >
                          Complete Order
                        </button>
                      )}

                      {/* Payment Toggle */}
                      {ord.paymentStatus !== 'PAID_AT_COUNTER' && ord.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleMarkPaid(ord.id)}
                          className="w-full py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-emerald-700 text-[11px] font-semibold border border-zinc-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
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
          <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-zinc-900">
                  Table & QR Management
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Persistent table QR codes point dynamically to <code className="text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded font-mono text-[11px]">/r/{restaurantSlug}/table/[slug]</code>
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsPrintMode(true)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold border border-zinc-200 shadow-sm flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4 text-red-600" />
                  Print QR Sheets
                </button>

                <button
                  onClick={() => setNewTableModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors"
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
                    className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-display font-extrabold text-lg text-zinc-900">
                          {t.tableNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            t.status === 'OCCUPIED'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-500 mt-1">
                        {t.location} • Capacity: <strong className="text-zinc-800">{t.capacity} Guests</strong>
                      </p>

                      <div className="mt-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
                        <span className="text-zinc-500">QR Status</span>
                        <span
                          className={`font-semibold ${
                            isActive ? 'text-emerald-600' : 'text-zinc-400'
                          }`}
                        >
                          {isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleViewQR(t)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 border border-zinc-200 flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-red-600" />
                        View QR
                      </button>

                      <button
                        onClick={() => handleToggleQR(t.id, isActive)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
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
          <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-zinc-900">
                  Menu & Food Items CMS
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Update item availability, pricing, photos, and categories in real-time.
                </p>
              </div>

              <button
                onClick={handleOpenAddFood}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Food Item
              </button>
            </div>

            {/* Categories & Dishes */}
            <div className="space-y-8">
              {menuCategories.map((cat) => (
                <div key={cat.id} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                    <h3 className="font-display font-bold text-base text-zinc-900">
                      {cat.name} ({cat.foodItems.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {cat.foodItems.map((fi: any) => (
                      <div
                        key={fi.id}
                        className={`p-4 rounded-2xl bg-white border flex flex-col justify-between gap-3 shadow-sm ${
                          fi.isAvailable ? 'border-zinc-200' : 'border-zinc-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Dish Image Thumbnail */}
                          <div className="w-16 h-14 sm:w-18 sm:h-16 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {fi.imageUrl ? (
                              <img
                                src={fi.imageUrl}
                                alt={fi.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-zinc-400" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  fi.isVeg ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                              />
                              <h4 className="font-bold text-xs sm:text-sm text-zinc-900 truncate">
                                {fi.name}
                              </h4>
                              {fi.isBestseller && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  Bestseller
                                </span>
                              )}
                              {fi.isSpicy && (
                                <span className="text-[10px]">🌶️</span>
                              )}
                            </div>

                            <span className="font-display font-bold text-xs text-red-600 mt-0.5 block">
                              ₹{fi.price} • {fi.preparationTime} mins
                            </span>

                            {fi.description && (
                              <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">
                                {fi.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions: Edit dish + Availability Toggle */}
                        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditFood(fi)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-1.5 border border-zinc-200 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-red-600" />
                            <span>Edit Dish</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleItemAvailability(fi.id, fi.isAvailable)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              fi.isAvailable
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
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
          <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-zinc-900">
                  Table Reservations
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Manage confirmed bookings, record arrivals, and prevent table clashes.
                </p>
              </div>

              <button
                onClick={handleCreateTestReservation}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Real Booking to DB
              </button>
            </div>

            {/* Fallback Notice if database empty */}
            {reservations.length === 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>
                    <strong>Database currently has 0 reservation records.</strong> Displaying 3 verified sample courtyard bookings so you can review the interface.
                  </span>
                </div>
                <button
                  onClick={handleCreateTestReservation}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs whitespace-nowrap shadow-sm"
                >
                  Create Real Reservation in DB
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(reservations.length > 0 ? reservations : FALLBACK_RESERVATIONS).map((r: any) => (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display font-bold text-base text-zinc-900">
                          {r.customerName}
                        </h3>
                        <p className="text-xs text-zinc-500">
                          {r.customerPhone} {r.customerEmail ? `• ${r.customerEmail}` : ''}
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                        {r.status}
                      </span>
                    </div>

                    <div className="mt-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1 text-xs text-zinc-700">
                      <p>
                        Table: <strong className="text-zinc-900">{r.table?.tableNumber || 'Table 4'}</strong> ({r.table?.location || 'Outdoor Courtyard'})
                      </p>
                      <p>
                        Date & Time: <strong className="text-zinc-900">{r.reservationDate} at {r.startTime}</strong>
                      </p>
                      <p>Guest Count: <strong className="text-zinc-900">{r.guestCount} Guests</strong></p>
                      {r.specialRequest && (
                        <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                          <strong>Special Request:</strong> "{r.specialRequest}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
                    <span>ID: {r.id.slice(0, 10)}...</span>
                    <span className="text-emerald-600 font-semibold">Confirmed ✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS & WEBSITE CMS */}
        {activeTab === 'SETTINGS' && settingsForm && (
          <div className="max-w-5xl space-y-8 animate-fade-in pb-12 mx-auto">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>Zero-Code Website CMS & Live Customizer</span>
              </div>
              <h2 className="font-display font-extrabold text-2xl text-zinc-900">
                Live Website Customizer & Controls
              </h2>
              <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
                Upload your cafe photos and logo directly from your device, edit hero headlines, customize Our Story narrative, update operating hours, and configure policies. Updates reflect instantly for guests without touching code.
              </p>
            </div>

            {/* Hidden file inputs for direct device upload */}
            <input
              ref={heroInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleDeviceImageUpload(e, 'heroImageUrl')}
              className="hidden"
            />
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleDeviceImageUpload(e, 'logoUrl')}
              className="hidden"
            />
            <input
              ref={storyInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleDeviceImageUpload(e, 'storyImageUrl')}
              className="hidden"
            />

            <form onSubmit={handleSaveSettings} className="space-y-8">
              
              {/* SECTION 1: Brand & Hero Presentation */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-zinc-200 space-y-6 shadow-sm">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-100">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    🎨
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-zinc-900">
                      Brand Identity & Hero Experience
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Configure your cafe's main title, hero statement, banner image, and logo.
                    </p>
                  </div>
                </div>

                {/* Hero Banner Device Upload & Controls */}
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-zinc-800 block">Hero Banner Image</label>
                      <p className="text-[11px] text-zinc-500">
                        Upload your real cafe photo from your phone or PC.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => heroInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Hero Image from Device</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, heroImageUrl: '/images/pit-cafe-front-view.jpg' })}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-red-600 text-[11px] font-semibold border border-zinc-200 transition-colors"
                      >
                        Use Authentic Cafe Front Photo
                      </button>

                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, heroImageUrl: '/images/hero-banner.jpg' })}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-600 text-[11px] font-medium border border-zinc-200 transition-colors"
                      >
                        Use Food Feast Banner
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={settingsForm.heroImageUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroImageUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:border-red-500 font-mono text-[11px]"
                    placeholder="/images/pit-cafe-front-view.jpg or https://... or base64"
                  />

                  {settingsForm.heroImageUrl && (
                    <div className="mt-2 w-full h-44 sm:h-56 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-900 relative shadow-inner">
                      <img
                        src={settingsForm.heroImageUrl}
                        alt="Hero Banner Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <span className="px-2 py-1 rounded bg-black/75 text-[10px] text-white font-mono backdrop-blur-sm">
                          Active Hero Banner
                        </span>
                        <button
                          type="button"
                          onClick={() => heroInputRef.current?.click()}
                          className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-[10px] text-white font-bold shadow"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logo Device Upload & Controls */}
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-zinc-800 block">Cafe Logo</label>
                      <p className="text-[11px] text-zinc-500">
                        Upload your custom logo or select an authentic Pit Cafe preset.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo from Device</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, logoUrl: '/images/pit-cafe-front-view.jpg' })}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-red-600 text-[11px] font-medium border border-zinc-200"
                      >
                        Use Cafe Front View Photo
                      </button>

                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, logoUrl: '/logo.png' })}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 text-[11px] font-medium border border-zinc-200"
                      >
                        Use Cutlery Seal
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border-2 border-red-500 overflow-hidden bg-black flex-shrink-0 flex items-center justify-center shadow-sm">
                      {settingsForm.logoUrl ? (
                        <img
                          src={settingsForm.logoUrl}
                          alt="Logo Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xs font-bold">PIT</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={settingsForm.logoUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:border-red-500 font-mono text-[11px]"
                      placeholder="/images/pit-cafe-front-view.jpg or /logo.png"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Cafe / Restaurant Name</label>
                    <input
                      type="text"
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Tagline / Slogan</label>
                    <input
                      type="text"
                      value={settingsForm.tagline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Hero Main Heading</label>
                  <input
                    type="text"
                    value={settingsForm.heroHeading}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroHeading: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                    placeholder="e.g. GOOD FOOD, BETTER ROADS"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Hero Subtitle / Description</label>
                  <textarea
                    value={settingsForm.heroSubtitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500 h-20"
                    placeholder="A cafe for riders, dreamers and food lovers. Great food, great company and a vibe that keeps you coming back."
                  />
                </div>
              </div>

              {/* SECTION 2: Our Story & Heritage Customizer */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-zinc-200 space-y-6 shadow-sm">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-100">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    📖
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-zinc-900">
                      "Our Story" & Heritage Section
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Craft the story of your cafe, biker culture, and food philosophy displayed on the homepage.
                    </p>
                  </div>
                </div>

                {/* Story Image Device Upload */}
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-zinc-800 block">Story Feature Image</label>
                      <p className="text-[11px] text-zinc-500">
                        Upload your real cafe photo or choose a preset.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => storyInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Story Photo from Device</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, storyImageUrl: '/images/pit-cafe-front-view.jpg' })}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-red-600 text-[11px] font-medium border border-zinc-200"
                      >
                        Use Cafe Front View
                      </button>

                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, storyImageUrl: '/images/our-story.jpg' })}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 text-[11px] font-medium border border-zinc-200"
                      >
                        Use Courtyard Photo
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={settingsForm.storyImageUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storyImageUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:border-red-500 font-mono text-[11px]"
                    placeholder="/images/pit-cafe-front-view.jpg or https://..."
                  />

                  {settingsForm.storyImageUrl && (
                    <div className="w-full h-44 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-900 relative shadow-inner">
                      <img src={settingsForm.storyImageUrl} alt="Story Preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-[10px] text-zinc-200 font-mono">
                        Story Photo Preview
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Section Eyebrow / Tag</label>
                  <input
                    type="text"
                    value={settingsForm.aboutHeading}
                    onChange={(e) => setSettingsForm({ ...settingsForm, aboutHeading: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                    placeholder="e.g. Our Story, The Pit Legacy"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                    Full Story / Narrative Text (Separate paragraphs with double newlines)
                  </label>
                  <textarea
                    value={settingsForm.aboutText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, aboutText: e.target.value })}
                    className="w-full px-3.5 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500 h-32 leading-relaxed"
                    placeholder="Tell your cafe's origin story, the thrill of motorcycle rides, premium ingredients, and community hangout vibe..."
                  />
                </div>
              </div>

              {/* SECTION 3: Footer Details & Diner Policies */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-zinc-200 space-y-6 shadow-sm">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    📜
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-zinc-900">
                      Footer Presentation & Diner Policies
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Customize footer summaries, payment policy statements, and copyright notices.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Footer Brand Summary / Bio</label>
                  <textarea
                    value={settingsForm.description}
                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500 h-20"
                    placeholder="Short summary displayed under your cafe name in the footer..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Policy Badge Title</label>
                    <input
                      type="text"
                      value={settingsForm.policyTitle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, policyTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                      placeholder="e.g. Counter Payment Model"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Custom Footer Copyright Line</label>
                    <input
                      type="text"
                      value={settingsForm.footerCopyright}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerCopyright: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                      placeholder="e.g. © 2026 The Pit Cafe. All rights reserved."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Policy Details & Instructions for Diners</label>
                  <textarea
                    value={settingsForm.policyText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, policyText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500 h-20"
                    placeholder="Explain payment method, freshness pledge, and counter settle process..."
                  />
                </div>
              </div>

              {/* SECTION 4: Location, Contact & Operating Hours */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-zinc-200 space-y-6 shadow-sm">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-100">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                    📍
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-zinc-900">
                      Location, Contact & Operating Hours
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Ensure your customers can easily locate, call, and visit your cafe.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Street Address</label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                      placeholder="House 5/114, Sector 16, Rohini"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">City</label>
                    <input
                      type="text"
                      value={settingsForm.city}
                      onChange={(e) => setSettingsForm({ ...settingsForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                      placeholder="New Delhi"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Pincode</label>
                    <input
                      type="text"
                      value={settingsForm.pincode}
                      onChange={(e) => setSettingsForm({ ...settingsForm, pincode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                      placeholder="110089"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                      placeholder="contact@thepitcafe.in"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Opening Hours</label>
                    <input
                      type="text"
                      value={settingsForm.openingHours}
                      onChange={(e) => setSettingsForm({ ...settingsForm, openingHours: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                      placeholder="8:00 AM - 11:00 PM"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Google Maps Link URL</label>
                    <input
                      type="text"
                      value={settingsForm.googleMapsUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, googleMapsUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500 font-mono text-[11px]"
                      placeholder="https://maps.google.com/?q=..."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Social Media Channels */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-zinc-200 space-y-6 shadow-sm">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-100">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                    🌐
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-zinc-900">
                      Social Media & Community Channels
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      These links populate the social badges in your footer and customer menus.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Instagram URL</label>
                    <input
                      type="text"
                      value={settingsForm.instagramUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                      placeholder="https://instagram.com/thepitcafe"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Facebook URL</label>
                    <input
                      type="text"
                      value={settingsForm.facebookUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                      placeholder="https://facebook.com/thepitcafe"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">WhatsApp Chat URL / Number</label>
                    <input
                      type="text"
                      value={settingsForm.whatsappUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                      placeholder="https://wa.me/919876543210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">YouTube URL</label>
                    <input
                      type="text"
                      value={settingsForm.youtubeUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, youtubeUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                      placeholder="https://youtube.com/@thepitcafe"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">X / Twitter URL</label>
                    <input
                      type="text"
                      value={settingsForm.twitterUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, twitterUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                      placeholder="https://twitter.com/thepitcafe"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 6: Operational Modes & Financial Rules */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-zinc-200 space-y-6 shadow-sm">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-100">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    ⚙️
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-zinc-900">
                      Operations, Taxes & Table Greetings
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Enable or pause ordering channels, configure GST, and customize table QR greetings.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs cursor-pointer hover:bg-zinc-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={settingsForm.dineInEnabled}
                      onChange={(e) => setSettingsForm({ ...settingsForm, dineInEnabled: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-zinc-800">Dine-In QR Ordering</span>
                  </label>

                  <label className="flex items-center gap-2 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs cursor-pointer hover:bg-zinc-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={settingsForm.takeawayEnabled}
                      onChange={(e) => setSettingsForm({ ...settingsForm, takeawayEnabled: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-zinc-800">Takeaway Orders</span>
                  </label>

                  <label className="flex items-center gap-2 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs cursor-pointer hover:bg-zinc-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={settingsForm.reservationsEnabled}
                      onChange={(e) => setSettingsForm({ ...settingsForm, reservationsEnabled: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-zinc-800">Table Reservations</span>
                  </label>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                  <label className="flex items-center gap-2.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.maintenanceMode}
                      onChange={(e) => setSettingsForm({ ...settingsForm, maintenanceMode: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="text-amber-900 font-bold">
                      Emergency Kitchen Pause / Maintenance Mode
                    </span>
                  </label>
                  {settingsForm.maintenanceMode && (
                    <input
                      type="text"
                      value={settingsForm.maintenanceNotice}
                      onChange={(e) => setSettingsForm({ ...settingsForm, maintenanceNotice: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-xs text-zinc-900 focus:outline-none"
                      placeholder="e.g. Kitchen is running at maximum capacity. We'll reopen orders at 8 PM."
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Tax / GST Percentage (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settingsForm.taxPercentage}
                      onChange={(e) => setSettingsForm({ ...settingsForm, taxPercentage: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1.5">QR Greeting Heading</label>
                    <input
                      type="text"
                      value={settingsForm.welcomeGreetingHeading}
                      onChange={(e) => setSettingsForm({ ...settingsForm, welcomeGreetingHeading: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500"
                      placeholder="Welcome to The Pit Cafe"
                    />
                  </div>
                </div>
              </div>

              {/* Save & Feedback Toolbar */}
              <div className="sticky bottom-6 z-30 p-4 rounded-2xl bg-white/95 border border-zinc-200 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                  {settingsSavedNotice ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1.5 animate-pulse">
                      <Check className="w-4 h-4" />
                      All changes saved and active across the website!
                    </span>
                  ) : (
                    <span className="text-zinc-500">
                      Changes update customer-facing pages, QR codes, and footers in real-time.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="submit"
                    className="w-full sm:w-auto py-3 px-8 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save All Changes</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}

        {/* TAB: CUSTOMERS CRM */}
        {activeTab === 'CUSTOMERS' && (
          <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-zinc-900">
                    Customer Database & Loyalty
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Profiles generated from dine-in QR orders and courtyard reservations.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">
                  {orders.length > 0 ? `${orders.length} Verified Diners` : '4 Active Diners'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-400 font-semibold">
                      <th className="pb-3 font-medium">Customer Name</th>
                      <th className="pb-3 font-medium">Phone Number</th>
                      <th className="pb-3 font-medium">Total Visits/Orders</th>
                      <th className="pb-3 font-medium">Favorite Category</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    <tr className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 font-bold text-zinc-900">Arjun Mehta</td>
                      <td className="py-3 text-zinc-600">+91 98765 43210</td>
                      <td className="py-3 font-semibold text-zinc-900">5 Orders</td>
                      <td className="py-3 text-zinc-600">Biker Burgers</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                          VIP Regular
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 font-bold text-zinc-900">Rahul Sharma</td>
                      <td className="py-3 text-zinc-600">+91 98112 34567</td>
                      <td className="py-3 font-semibold text-zinc-900">3 Orders</td>
                      <td className="py-3 text-zinc-600">Tandoori Chaap</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                          Courtyard Diner
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 font-bold text-zinc-900">Priya Kapoor</td>
                      <td className="py-3 text-zinc-600">+91 99991 22334</td>
                      <td className="py-3 font-semibold text-zinc-900">4 Orders</td>
                      <td className="py-3 text-zinc-600">Garlic Bread & Shakes</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600">
                          Foodie Club
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 font-bold text-zinc-900">Sneha Roy</td>
                      <td className="py-3 text-zinc-600">+91 97110 99887</td>
                      <td className="py-3 font-semibold text-zinc-900">2 Orders</td>
                      <td className="py-3 text-zinc-600">Peri Peri Fries</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600">
                          New Guest
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ANALYTICS */}
        {activeTab === 'ANALYTICS' && (
          <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-3">
                <h3 className="font-display font-bold text-base text-zinc-900">
                  Peak Courtyard Hours
                </h3>
                <p className="text-xs text-zinc-500">
                  Highest customer traffic occurs between 8:00 PM and 1:30 AM.
                </p>
                <div className="space-y-2 pt-2">
                  {[
                    { time: '10 AM – 2 PM', pct: '35%', label: 'Lunch & Chill' },
                    { time: '2 PM – 6 PM', pct: '20%', label: 'Afternoon Slump' },
                    { time: '6 PM – 11 PM', pct: '88%', label: 'Dinner Rush' },
                    { time: '11 PM – 4 AM', pct: '95%', label: 'Biker Night Peak' },
                  ].map((slot) => (
                    <div key={slot.time} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-zinc-700">{slot.time} ({slot.label})</span>
                        <span className="font-bold text-zinc-900">{slot.pct}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                        <div
                          className="h-full bg-red-600 rounded-full"
                          style={{ width: slot.pct }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-3">
                <h3 className="font-display font-bold text-base text-zinc-900">
                  Average Table Turnover
                </h3>
                <p className="text-xs text-zinc-500">
                  Average dining duration across all courtyard and indoor tables.
                </p>
                <div className="flex items-center gap-6 pt-4">
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-center flex-1">
                    <span className="block text-2xl font-black text-zinc-900">42 min</span>
                    <span className="text-[11px] text-zinc-500">Dine-In Turnover</span>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-center flex-1">
                    <span className="block text-2xl font-black text-zinc-900">14 min</span>
                    <span className="text-[11px] text-zinc-500">Kitchen Prep Speed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>

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
