'use client';

import { useI18n } from '@/lib/i18n/context';
import { Department, UserRole } from '@/types/database';
import { ArrowLeft, Lock, Mail, Shield, User } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

export default function LoginPage() {
  const { t } = useI18n();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [department, setDepartment] = useState<Department>('city_corporation');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setTimeout(() => {
      setLoading(false);
      setMsg(isSignUp ? 'Account registered successfully!' : 'Signed in successfully as ' + role);
    }, 600);
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
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs text-center">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg transition-all"
          >
            {loading ? 'Processing...' : isSignUp ? t('auth_submit_signup') : t('auth_submit_login')}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-indigo-400 hover:underline font-medium"
          >
            {isSignUp ? t('auth_toggle_login') : t('auth_toggle_signup')}
          </button>
        </div>
      </div>
    </div>
  );
}
