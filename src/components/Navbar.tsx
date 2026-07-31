'use client';

import { useAuth } from '@/lib/auth/context';
import { useI18n } from '@/lib/i18n/context';
import { Globe, LogIn, LogOut, MapPin, Phone, PlusCircle, Shield, ShieldAlert, User, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';

export const Navbar: React.FC = () => {
  const { lang, setLang, t } = useI18n();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sosSending, setSosSending] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);

  const isAuthority = profile?.role === 'authority';

  const handleSOSTrigger = async () => {
    setSosSending(true);
    let lat = 23.777176;
    let lng = 90.399452;

    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {
        console.warn('Geolocation fallback to Dhaka center');
      }
    }

    try {
      await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      });
      setSosModalOpen(true);
    } catch {
      alert('SOS signal failed to send. Please call 999 immediately.');
    } finally {
      setSosSending(false);
    }
  };

  const handleSignOut = async () => {
    // Clear role cookie
    document.cookie = 'nirapod_role=; path=/; max-age=0';
    await signOut();
    router.push('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-lg shadow-rose-900/30 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                {t('app_name')}
              </span>
              <span className="hidden md:block text-[10px] text-rose-400 font-medium tracking-wider uppercase">
                Dhaka Safety Net
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname === '/'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              {t('nav_map')}
            </Link>

            <Link
              href="/report"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname === '/report'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              {t('nav_report')}
            </Link>

            {/* Authority link — shown to authority users or always visible for demo */}
            {(isAuthority || !user) && (
              <Link
                href="/authority"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  pathname === '/authority'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <UserCheck className="w-4 h-4 text-blue-400" />
                {t('nav_authority')}
              </Link>
            )}
          </nav>

          {/* Actions & Auth */}
          <div className="flex items-center gap-3">
            {/* SOS Button */}
            <button
              onClick={handleSOSTrigger}
              disabled={sosSending}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-900/40 border border-red-400/30 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 animate-pulse"
            >
              <ShieldAlert className="w-4 h-4 text-white" />
              {sosSending ? t('sos_alerting') : t('sos_button')}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              {lang === 'en' ? 'বাংলা' : 'English'}
            </button>

            {/* Auth Button */}
            {!authLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    {/* User role badge */}
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        {profile?.role || 'user'}
                      </span>
                      {profile?.department && (
                        <span className="text-[9px] text-slate-500">
                          · {profile.department.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-900/50 border border-slate-700 hover:border-red-500/40 text-xs font-semibold text-slate-300 hover:text-red-300 flex items-center gap-1.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {t('nav_logout')}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-900/30"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    {t('nav_login')}
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800 py-2 bg-slate-900/95 text-xs">
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 px-3 py-1 ${
              pathname === '/' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <MapPin className="w-4 h-4" />
            {t('nav_map')}
          </Link>
          <Link
            href="/report"
            className={`flex flex-col items-center gap-1 px-3 py-1 ${
              pathname === '/report' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            {t('nav_report')}
          </Link>
          {(isAuthority || !user) && (
            <Link
              href="/authority"
              className={`flex flex-col items-center gap-1 px-3 py-1 ${
                pathname === '/authority' ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              {t('nav_authority')}
            </Link>
          )}
          {!authLoading && (
            user ? (
              <button
                onClick={handleSignOut}
                className="flex flex-col items-center gap-1 px-3 py-1 text-slate-400"
              >
                <LogOut className="w-4 h-4" />
                {t('nav_logout')}
              </button>
            ) : (
              <Link
                href="/login"
                className={`flex flex-col items-center gap-1 px-3 py-1 ${
                  pathname === '/login' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                }`}
              >
                <LogIn className="w-4 h-4" />
                {t('nav_login')}
              </Link>
            )
          )}
        </div>
      </header>

      {/* SOS Modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl p-6 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('sos_sent_title')}</h3>
            <p className="text-slate-300 text-sm mb-6">{t('sos_sent_desc')}</p>

            <div className="flex flex-col gap-3">
              <a
                href="tel:999"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/50"
              >
                <Phone className="w-5 h-5 fill-white" />
                {t('sos_999_btn')} (Bangladesh Emergency)
              </a>

              <button
                onClick={() => setSosModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm border border-slate-700"
              >
                Dismiss Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
