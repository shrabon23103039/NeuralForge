'use client';

import { AIBadge } from '@/components/AIBadge';
import { useI18n } from '@/lib/i18n/context';
import { Report } from '@/types/database';
import { ArrowLeft, Bot, Calendar, CheckCircle2, MapPin, ThumbsDown, ThumbsUp, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function ReportDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { lang, t } = useI18n();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${id}`);
      const json = await res.json();
      if (json.success) {
        setReport(json.data);
      } else {
        setError('Report not found');
      }
    } catch (e) {
      setError('Failed to load report detail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchReport();
  }, [id]);

  const handleVote = async (voteType: 'confirm' | 'dispute') => {
    if (!report || voting) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/reports/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: voteType }),
      });
      const json = await res.json();
      if (json.success) {
        setReport(json.data);
      }
    } catch (e) {
      console.error('Vote failed', e);
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm animate-pulse flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-3"></div>
        Loading Report Details...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-red-400 font-semibold text-base">{error || 'Report not found'}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back_to_map')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('back_to_map')}
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Photo Banner if available */}
        {report.photo_url && (
          <div className="w-full h-64 sm:h-80 bg-slate-950 overflow-hidden relative border-b border-slate-800">
            <img
              src={report.photo_url}
              alt={report.category}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* AI Badge & Header */}
          <div className="space-y-3">
            <AIBadge
              category={report.category}
              severity={report.severity}
              targetDepartment={report.target_department}
              isValid={report.ai_is_valid}
            />

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white capitalize tracking-tight">
              {report.category.replace('_', ' ')} Incident
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <MapPin className="w-4 h-4" />
                Lat: {report.lat}, Lng: {report.lng}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-500" />
                {new Date(report.created_at).toLocaleString()}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 capitalize font-medium">
                Type: {report.report_type}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 capitalize font-medium">
                Status: {report.status.replace('_', ' ')}
              </span>
              {report.target_department && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-500/40 text-blue-300 capitalize font-medium">
                  Dept: {report.target_department.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>

          {/* AI Generated Summaries Card */}
          <div className="p-5 rounded-xl bg-slate-800/80 border border-indigo-500/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-300 uppercase tracking-wider">
              <Bot className="w-4 h-4 text-indigo-400" />
              AI Multimodal Summary & Routing Note
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-700/80">
                <span className="block text-[10px] font-bold text-slate-400 mb-1">ENGLISH BRIEF</span>
                <p className="text-slate-200 leading-relaxed">
                  {report.ai_summary_en || report.description}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-700/80">
                <span className="block text-[10px] font-bold text-slate-400 mb-1">বাংলা সংক্ষিপ্ত বিবরণ</span>
                <p className="text-slate-200 leading-relaxed font-sans">
                  {report.ai_summary_bn || 'রিপোর্টের সারসংক্ষেপ প্রক্রিয়াধীন।'}
                </p>
              </div>
            </div>
          </div>

          {/* Citizen Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Citizen Description
            </h3>
            <p className="text-sm text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed">
              {report.description}
            </p>
          </div>

          {/* Community Verification Voting */}
          <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Community Verification</h4>
              <p className="text-xs text-slate-400">
                Confirming helps city authorities prioritize high-impact hazards.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVote('confirm')}
                disabled={voting}
                className="px-4 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 transition-all hover:scale-105"
              >
                <ThumbsUp className="w-4 h-4 text-emerald-400" />
                {t('confirm_report')} ({report.confirm_count || 0})
              </button>

              <button
                onClick={() => handleVote('dispute')}
                disabled={voting}
                className="px-4 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2 transition-all hover:scale-105"
              >
                <ThumbsDown className="w-4 h-4 text-rose-400" />
                {t('dispute_report')} ({report.dispute_count || 0})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
