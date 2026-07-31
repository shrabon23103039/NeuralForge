'use client';

import { supabaseBrowser } from '@/lib/supabase/client';
import { AIBadge } from '@/components/AIBadge';
import { useI18n } from '@/lib/i18n/context';
import { AISummaryResult } from '@/lib/ai/summarizer';
import { Department, Report, SOSAlert, Status } from '@/types/database';
import { AlertCircle, Bot, Building2, CheckCircle2, Filter, RefreshCw, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function AuthorityDashboardPage() {
  const { lang, t } = useI18n();

  const [reports, setReports] = useState<Report[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [briefing, setBriefing] = useState<AISummaryResult | null>(null);
  const [generatingBriefing, setGeneratingBriefing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [repRes, sosRes] = await Promise.all([
        fetch(`/api/reports?department=${deptFilter}&status=${statusFilter}&category=${categoryFilter}`),
        fetch('/api/sos'),
      ]);

      const repJson = await repRes.json();
      const sosJson = await sosRes.json();

      if (repJson.success) setReports(repJson.data);
      if (sosJson.success) setSosAlerts(sosJson.data);
    } catch (e) {
      console.error('Failed to load authority dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabaseBrowser
      .channel('authority_sos_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sos_alerts' },
        (payload) => {
          const newAlert = payload.new as SOSAlert;
          setSosAlerts(prev => [newAlert, ...prev.filter(a => a.id !== newAlert.id)]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sos_alerts' },
        (payload) => {
          const updatedAlert = payload.new as SOSAlert;
          setSosAlerts(prev => prev.map(a => (a.id === updatedAlert.id ? updatedAlert : a)));
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [deptFilter, statusFilter, categoryFilter]);

  const handleStatusChange = async (reportId: string, newStatus: Status) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setReports(prev => prev.map(r => (r.id === reportId ? json.data : r)));
      }
    } catch (e) {
      console.error('Status change error', e);
    }
  };

  const handleGenerateBriefing = async () => {
    setGeneratingBriefing(true);
    try {
      const res = await fetch('/api/authority/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department: deptFilter, lang }),
      });
      const json = await res.json();
      if (json.success) {
        setBriefing(json.data);
      }
    } catch (e) {
      console.error('Briefing error', e);
    } finally {
      setGeneratingBriefing(false);
    }
  };

  const activeSOSAlerts = sosAlerts.filter(s => s.status === 'active');

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            Authority Triage & Action Portal
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {t('authority_title')}
          </h1>
          <p className="text-xs text-slate-400">
            Real-time routed citizen incident queue for Dhaka Municipal & Emergency Services.
          </p>
        </div>

        <button
          onClick={handleGenerateBriefing}
          disabled={generatingBriefing}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Bot className={`w-4 h-4 text-blue-300 ${generatingBriefing ? 'animate-spin' : ''}`} />
          {generatingBriefing ? t('authority_summary_loading') : t('authority_summary_btn')}
        </button>
      </div>

      {/* Active SOS Emergency Feed Banner */}
      {activeSOSAlerts.length > 0 && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/60 shadow-lg shadow-red-950/50 space-y-3 animate-pulse">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 animate-bounce" />
              {activeSOSAlerts.length} Active Emergency SOS Pings Received
            </span>
            <span className="text-[10px] text-red-400 font-mono">PRIORITY HIGH</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeSOSAlerts.map(sos => (
              <div key={sos.id} className="p-3 rounded-lg bg-slate-900/90 border border-red-500/40 text-xs">
                <div className="font-bold text-red-400 mb-1">GPS Coords: {sos.lat}, {sos.lng}</div>
                <div className="text-[10px] text-slate-400">Triggered: {new Date(sos.created_at).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Executive Briefing Panel */}
      {briefing && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/40 shadow-2xl space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              {t('authority_summary_title')}
            </h3>
            <button
              onClick={() => setBriefing(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {lang === 'bn' ? briefing.summary_bn : briefing.summary_en}
          </p>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Recommended Prioritized Actions:
            </span>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {(lang === 'bn' ? briefing.action_items_bn : briefing.action_items_en).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        {/* Department Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            {t('authority_filter_dept')}
          </label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">{t('authority_filter_all')}</option>
            <option value="city_corporation">{t('dept_city_corporation')}</option>
            <option value="disaster_management">{t('dept_disaster_management')}</option>
            <option value="police">{t('dept_police')}</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            {t('authority_filter_status')}
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="received">{t('status_received')}</option>
            <option value="verified">{t('status_verified')}</option>
            <option value="in_progress">{t('status_in_progress')}</option>
            <option value="resolved">{t('status_resolved')}</option>
            <option value="rejected">{t('status_rejected')}</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            Category Filter
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Categories</option>
            <option value="manhole">{t('category_manhole')}</option>
            <option value="snatching">{t('category_snatching')}</option>
            <option value="robbery">{t('category_robbery')}</option>
            <option value="road_damage">{t('category_road_damage')}</option>
            <option value="drain">{t('category_drain')}</option>
            <option value="fire_risk">{t('category_fire_risk')}</option>
            <option value="other">{t('category_other')}</option>
          </select>
        </div>
      </div>

      {/* Reports Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Routed Incident Queue ({reports.length})
          </h3>

          <button
            onClick={fetchData}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">AI Triage</th>
                <th className="py-3.5 px-4">Incident Category</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Routed Dept</th>
                <th className="py-3.5 px-4">Votes</th>
                <th className="py-3.5 px-4">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No incident reports found for current filters.
                  </td>
                </tr>
              ) : (
                reports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <AIBadge
                        category={report.category}
                        severity={report.severity}
                        targetDepartment={report.target_department}
                        isValid={report.ai_is_valid}
                      />
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white capitalize whitespace-nowrap">
                      {report.category.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-300">
                        {lang === 'bn' && report.ai_summary_bn ? report.ai_summary_bn : report.description}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-medium">
                      {report.target_department}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-emerald-400">
                      👍 {report.confirm_count || 0}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusChange(report.id, e.target.value as Status)}
                        className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
                      >
                        <option value="received">{t('status_received')}</option>
                        <option value="verified">{t('status_verified')}</option>
                        <option value="in_progress">{t('status_in_progress')}</option>
                        <option value="resolved">{t('status_resolved')}</option>
                        <option value="rejected">{t('status_rejected')}</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
