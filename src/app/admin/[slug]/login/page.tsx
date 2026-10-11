'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Shield, Lock, ArrowRight, AlertCircle, Utensils } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantSlug = params.slug as string;

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/restaurant/${restaurantSlug}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push(`/admin/${restaurantSlug}`);
    } catch (err: any) {
      setError(err.message || 'Invalid manager PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkSurface-bg flex flex-col items-center justify-center p-4">
      <div className="max-w-sm w-full p-8 rounded-3xl bg-darkSurface-card border border-darkSurface-border shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center mx-auto shadow-glow">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-white">
            Manager Access
          </h1>
          <p className="text-xs text-zinc-400">
            Enter management PIN to access restaurant controls for {restaurantSlug}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brand-400" />
              Manager PIN
            </label>
            <input
              type="password"
              maxLength={8}
              autoFocus
              placeholder="Default: 1234"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-center text-white tracking-widest font-mono focus:outline-none focus:border-brand-500 shadow-inner"
              required
            />
            <p className="text-[10px] text-zinc-500 mt-1 text-center">
              (Demo PIN: <strong className="text-zinc-300">1234</strong>)
            </p>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-xs shadow-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying...' : 'Unlock Admin Panel'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center border-t border-zinc-800">
          <Link
            href={`/r/${restaurantSlug}`}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
