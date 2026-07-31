'use client';

import { useI18n } from '@/lib/i18n/context';
import { SOSAlert } from '@/types/database';
import { AlertTriangle, CheckCircle2, Loader2, Phone, ShieldAlert } from 'lucide-react';
import React, { useState } from 'react';

interface SOSButtonProps {
  onSOSTriggered?: (alert: SOSAlert) => void;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ onSOSTriggered }) => {
  const { t } = useI18n();

  const [sending, setSending] = useState(false);
  const [sentAlert, setSentAlert] = useState<SOSAlert | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSOS = async () => {
    setSending(true);
    setError(null);

    let lat = 23.7508;
    let lng = 90.3742;

    // Attempt GPS capture with a 5-second timeout
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: true,
          });
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch {
        // GPS unavailable — fall back to default Dhaka coordinates
        console.warn('[SOS] Geolocation unavailable, using default Dhaka coordinates');
      }
    }

    try {
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || 'SOS dispatch failed');
      }

      setSentAlert(json.data);
      if (onSOSTriggered) onSOSTriggered(json.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send SOS alert';
      setError(message);
    } finally {
      setSending(false);
    }
  };

  // After successful SOS dispatch
  if (sentAlert) {
    return (
      <div className="p-4 rounded-2xl bg-red-950/80 border-2 border-red-500/60 shadow-lg shadow-red-950/50 space-y-3 animate-in fade-in duration-300">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-extrabold text-red-200">{t('sos_sent_title')}</span>
        </div>
        <p className="text-xs text-red-300/90">{t('sos_sent_desc')}</p>
        <div className="text-[10px] text-slate-400 font-mono">
          GPS: {sentAlert.lat.toFixed(6)}, {sentAlert.lng.toFixed(6)} · {new Date(sentAlert.created_at).toLocaleTimeString()}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <a
            href="tel:999"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all hover:scale-105 active:scale-95"
          >
            <Phone className="w-4 h-4" />
            {t('sos_999_btn')}
          </a>
          <button
            onClick={() => setSentAlert(null)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* SOS Button */}
      <button
        onClick={handleSOS}
        disabled={sending}
        className="relative px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-sm flex items-center gap-2.5 shadow-lg shadow-red-900/50 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
      >
        {/* Pulsing ring behind button */}
        <span className="absolute inset-0 rounded-2xl animate-ping bg-red-600/30 pointer-events-none" />
        {sending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t('sos_alerting')}
          </>
        ) : (
          <>
            <ShieldAlert className="w-5 h-5" />
            {t('sos_button')}
          </>
        )}
      </button>

      {/* tel:999 Quick-Dial Fallback */}
      <a
        href="tel:999"
        className="px-4 py-3 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
      >
        <Phone className="w-4 h-4 text-emerald-400" />
        {t('sos_999_btn')}
      </a>

      {error && (
        <span className="text-xs text-red-400 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          {error}
        </span>
      )}
    </div>
  );
};
