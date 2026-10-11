import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'The Pit Cafe & Restaurant Platform',
  description: 'Digital food menus, table QR ordering, reservations, and restaurant operating platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable}`}>
      <body className="bg-darkSurface-bg text-zinc-100 min-h-screen flex flex-col font-sans antialiased selection:bg-brand-500/30 selection:text-brand-300">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
