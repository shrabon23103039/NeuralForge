'use client';

import { supabaseBrowser } from '@/lib/supabase/client';
import { AIBadge } from '@/components/AIBadge';
import { Map } from '@/components/Map';
import { SOSButton } from '@/components/SOSButton';
import { useI18n } from '@/lib/i18n/context';
import { HotspotCell, Report, SOSAlert } from '@/types/database';
import { AlertTriangle, Database, Filter, Flame, MapPin, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function HomePage() {
  const { lang, t } = useI18n();

  const [reports, setReports] = useState<Report[]>([]);
  const [hotspots, setHotspots] = useState<HotspotCell[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<string>('all');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [repRes, hotRes, sosRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/hotspots'),
        fetch('/api/sos'),
      ]);

      const repJson = await repRes.json();
      const hotJson = await hotRes.json();
      const sosJson = await sosRes.json();

      if (repJson.success) setReports(repJson.data);
      if (hotJson.success) setHotspots(hotJson.data);
      if (sosJson.success) setSosAlerts(sosJson.data);
    } catch (err) {
      console.error('Failed to load map data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabaseBrowser
      .channel('citizen_sos_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sos_alerts' },
        (payload) => {
          const newAlert = payload.new as SOSAlert;
          setSosAlerts(prev => [newAlert, ...prev.filter(a => a.id !== newAlert.id)]);
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    setSeedSuccessMsg(null);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setSeedSuccessMsg(t('seed_success'));
        await fetchData();
      }
    } catch (err) {
      console.error('Seeding error', err);
    } finally {
      setSeeding(false);
    }
  };

  const filteredReports = reports.filter(r => {
    if (selectedType === 'crime') return r.report_type === 'crime';
    if (selectedType === 'hazard') return r.report_type === 'hazard';
    if (selectedType === 'high') return r.severity === 'high';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Dhaka Hackathon Prototype
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {t('hero_title')}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('hero_desc')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Database className={`w-4 h-4 text-emerald-400 ${seeding ? 'animate-spin' : ''}`} />
              {seeding ? t('seed_loading') : t('seed_button')}
            </button>

            <Link
              href="/report"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-900/30 transition-all hover:scale-105 active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              {t('nav_report')}
            </Link>
          </div>
        </div>

        {/* SOS Emergency Row */}
        <div className="relative z-10 mt-4 pt-4 border-t border-slate-700/50">
          <SOSButton onSOSTriggered={() => fetchData()} />
        </div>

        {seedSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{seedSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Control Bar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            Filter:
          </span>
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedType === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Reports ({reports.length})
          </button>
          <button
            onClick={() => setSelectedType('crime')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedType === 'crime'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🚨 Crime Only
          </button>
          <button
            onClick={() => setSelectedType('hazard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedType === 'hazard'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🛠️ Infrastructure
          </button>
          <button
            onClick={() => setSelectedType('high')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedType === 'high'
                ? 'bg-red-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ⚠️ High Severity
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            Show AI Risk Heatmap
          </label>

          <button
            onClick={fetchData}
            title="Refresh Map Data"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Map + Side Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[550px]">
        {/* Leaflet Map Column */}
        <div className="lg:col-span-2 h-[550px]">
          <Map
            reports={filteredReports}
            hotspots={showHeatmap ? hotspots : []}
            sosAlerts={sosAlerts}
          />
        </div>

        {/* Live Feed Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[550px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Dhaka Live Hazard Stream ({filteredReports.length})
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">LIVE</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                {t('no_reports_found')}
              </div>
            ) : (
              filteredReports.map(report => (
                <Link
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className="block p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition-all group"
                >
                  <div className="mb-2">
                    <AIBadge
                      category={report.category}
                      severity={report.severity}
                      targetDepartment={report.target_department}
                      isValid={report.ai_is_valid}
                    />
                  </div>

                  <h4 className="font-semibold text-xs text-white group-hover:text-amber-400 capitalize transition-colors line-clamp-1">
                    {report.category.replace('_', ' ')}
                  </h4>

                  <p className="text-xs text-slate-300 line-clamp-2 my-1.5">
                    {lang === 'bn' && report.ai_summary_bn ? report.ai_summary_bn : report.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/50">
                    <span>👍 {report.confirm_count || 0} Confirmations</span>
                    <span className="text-indigo-400 group-hover:underline">View details →</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
