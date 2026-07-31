'use client';

import { useAuth } from '@/lib/auth/context';
import { useI18n } from '@/lib/i18n/context';
import { Department, UserRole } from '@/types/database';
import { ArrowLeft, CheckCircle, Lock, Mail, Shield, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';

function LoginPageForm() {
  const { t } = useI18n();
  const { signIn, signUp, user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [department, setDepartment] = useState<Department>('city_corporation');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && profile) {
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    }
  }, [authLoading, user, profile, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setIsError(false);

    if (isSignUp) {
      const { error } = await signUp(
        email,
        password,
        role,
        role === 'authority' ? department : undefined
      );
      if (error) {
        setMsg(error);
        setIsError(true);
      } else {
        // Set role cookie for proxy middleware
        document.cookie = `nirapod_role=${role}; path=/; max-age=31536000; SameSite=Lax`;
        setMsg('Account created successfully! Redirecting...');
        setIsError(false);
        const redirect = searchParams.get('redirect') || (role === 'authority' ? '/authority' : '/');
        setTimeout(() => router.push(redirect), 800);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setMsg(error);
        setIsError(true);
      } else {
        setMsg('Signed in successfully! Redirecting...');
        setIsError(false);
        // Profile will be loaded by AuthProvider; set role cookie after a brief delay
        setTimeout(async () => {
          // Re-fetch profile to get role for cookie
          const { supabaseBrowser } = await import('@/lib/supabase/client');
          const { data: { user: currentUser } } = await supabaseBrowser.auth.getUser();
          if (currentUser) {
            const { data: profileData } = await supabaseBrowser
              .from('profiles')
              .select('role')
              .eq('id', currentUser.id)
              .single();
            if (profileData) {
              document.cookie = `nirapod_role=${profileData.role}; path=/; max-age=31536000; SameSite=Lax`;
            }
          }
          const redirect = searchParams.get('redirect') || '/';
          router.push(redirect);
        }, 500);
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('back_to_map')}
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white">{t('auth_login_title')}</h1>
          <p className="text-xs text-slate-400">Dhaka Citizen & Authority Access Portal</p>
        </div>

        {msg && (
          <div
            className={`p-3 rounded-xl border text-xs text-center flex items-center justify-center gap-2 ${
              isError
                ? 'bg-red-950/80 border-red-500/40 text-red-300'
                : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {isError ? <XCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t('auth_email')}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t('auth_password')}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('auth_role')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('citizen')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      role === 'citizen'
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {t('auth_role_citizen')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('authority')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      role === 'authority'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {t('auth_role_authority')}
                  </button>
                </div>
              </div>

              {role === 'authority' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('auth_dept_label')}
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200"
                  >
                    <option value="city_corporation">{t('dept_city_corporation')}</option>
                    <option value="disaster_management">{t('dept_disaster_management')}</option>
                    <option value="police">{t('dept_police')}</option>
                  </select>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? t('auth_submit_signup') : t('auth_submit_login')}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setMsg(null); setIsError(false); }}
            className="text-xs text-indigo-400 hover:underline font-medium"
          >
            {isSignUp ? t('auth_toggle_login') : t('auth_toggle_signup')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-xs text-slate-400">Loading...</div>}>
      <LoginPageForm />
    </Suspense>
  );
}
