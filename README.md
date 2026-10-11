# The Pit Cafe — Contactless QR Dining & Restaurant Management Platform

A high-performance, full-stack digital ordering, contactless table QR dine-in, and reservation platform tailored for modern cafes, fast-casual restaurants, and food establishments. 

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**.

---

## 🌟 Key Features

### 🍽️ Digital Dine-In & Contactless Ordering
- **Table-Specific QR Ordering**: Guests scan physical QR standees (e.g., Table 1 to 50) on their smartphones to launch an active dine-in session without installing an app.
- **Dynamic Cart & Bill Calculation**: Real-time subtotal, GST calculation, discounts, and coupon code support.
- **Pay-At-Counter Model**: Frictionless ordering with zero payment gateway drop-offs. Customers confirm orders from their phone and settle via UPI/Cash/Card at the billing counter.
- **Takeaway Support**: Customers can toggle between Dine-In and Takeaway with custom pickup times and notes.

### 📅 Live Table Reservations
- Real-time availability checking by date, time slot, and guest count.
- Instant table assignment with automated table recognition upon arrival.

### ⚡ Live Order Tracking
- Dedicated customer order status screen with real-time updates (Pending, In Kitchen, Ready, Served, Completed).
- Order history and lookup by customer phone number.

### 🛠️ Administrative & Store Management Dashboard
- **Live Kitchen Order Management**: Real-time order flow and kitchen status controls.
- **Menu Management**: Categorized food items, custom modifiers, add-on groups, spicy/veg badges, price updates, and instant out-of-stock toggles.
- **Table & QR Code Manager**: One-click generation and preview of table QR codes.
- **Store Configuration & Theme Customizer**: Customizable primary brand colors, dark/light modes, announcement banners, opening hours, and contact details.

---

## 🏗️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/) (SQLite for development, PostgreSQL-ready for production)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.18+` or `v20+`
- **npm** or **yarn**

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/VivekNCodes/The-Pits-Cafe.git
cd The-Pits-Cafe
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default local `.env` configuration:
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_PIN="1234"
AUTH_SECRET="the-pit-cafe-production-secret-token-key-32chars"
```

### 4. Database Setup & Seeding
Run Prisma migrations and seed the database with authentic cafe items:
```bash
npx prisma db push
node prisma/seed.js
```

### 5. Running the Application
Start the local development server:
```bash
npm run dev
```

Visit the application in your browser:
- **Customer Facing Flagship**: `http://localhost:3000` (or `http://localhost:3000/r/the-pit-cafe`)
- **Table QR Simulation**: `http://localhost:3000/r/the-pit-cafe/table/t-39`
- **Table Reservation**: `http://localhost:3000/r/the-pit-cafe/reservation`
- **Admin Management Portal**: `http://localhost:3000/admin/the-pit-cafe` (Default PIN: `1234`)

---

## 📦 Production Build

To build and validate the application for production:
```bash
npm run build
npm start
```

---

## 📄 License
This project is proprietary and built for **The Pit Cafe**. All rights reserved.
