'use client';

import { useI18n } from '@/lib/i18n/context';
import { Category, Report, ReportType } from '@/types/database';
import { AlertCircle, Bot, CheckCircle2, MapPin, Navigation, Send, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { AIBadge } from './AIBadge';

export const ReportForm: React.FC<{ onReportCreated?: (report: Report) => void }> = ({ onReportCreated }) => {
  const { t } = useI18n();

  const [reportType, setReportType] = useState<ReportType>('hazard');
  const [category, setCategory] = useState<Category>('manhole');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState<string>('23.7508');
  const [lng, setLng] = useState<string>('90.3742');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');

  const [loading, setLoading] = useState(false);
  const [fetchingGps, setFetchingGps] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      // Remove data URL header for Gemini API
      const base64Data = result.split(',')[1];
      setPhotoBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleFetchLocation = () => {
    setFetchingGps(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Using manual coordinates.');
      setFetchingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setFetchingGps(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setError('GPS signal unavailable. You can enter lat/lng manually.');
        setFetchingGps(false);
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a brief description of the incident/hazard.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: reportType,
          category,
          description,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          photo_url: photoPreview,
          photoBase64: photoBase64 || undefined,
          mimeType,
        }),
      });

      const resData = await response.json();

      if (!resData.success) {
        throw new Error(resData.error || 'Failed to submit report.');
      }

      setSubmittedReport(resData.data);
      if (onReportCreated) onReportCreated(resData.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error creating report. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl w-full mx-auto">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{t('report_form_title')}</h2>
          <p className="text-xs text-slate-400">Dhaka Public Safety Triage</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {submittedReport ? (
        <div className="p-6 rounded-2xl bg-slate-800/80 border border-emerald-500/40 text-center animate-in fade-in duration-300">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Report Successfully Submitted!</h3>
          <p className="text-slate-300 text-sm mb-4">
            AI has classified your report and dispatched it to authorities.
          </p>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 text-left mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">AI Classification Triage</span>
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <AIBadge
              category={submittedReport.category}
              severity={submittedReport.severity}
              targetDepartment={submittedReport.target_department}
              isValid={submittedReport.ai_is_valid}
            />
            {submittedReport.ai_summary_en && (
              <p className="mt-3 text-xs text-slate-300 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                🤖 <strong>AI Summary:</strong> {submittedReport.ai_summary_en}
              </p>
            )}
          </div>

          <button
            onClick={() => {
              setSubmittedReport(null);
              setDescription('');
              setPhotoPreview(null);
              setPhotoBase64(null);
            }}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold transition-colors"
          >
            Submit Another Report
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Report Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {t('report_form_type')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setReportType('hazard');
                  setCategory('manhole');
                }}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  reportType === 'hazard'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-900/30'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                🛠️ {t('report_form_type_hazard')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportType('crime');
                  setCategory('snatching');
                }}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  reportType === 'crime'
                    ? 'bg-red-500/20 border-red-500 text-red-300 shadow-md shadow-red-900/30'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                🚨 {t('report_form_type_crime')}
              </button>
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {t('report_form_category')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="manhole">{t('category_manhole')}</option>
              <option value="snatching">{t('category_snatching')}</option>
              <option value="robbery">{t('category_robbery')}</option>
              <option value="road_damage">{t('category_road_damage')}</option>
              <option value="drain">{t('category_drain')}</option>
              <option value="fire_risk">{t('category_fire_risk')}</option>
              <option value="other">{t('category_other')}</option>
            </select>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {t('report_form_desc')}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('report_form_desc_placeholder')}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {t('report_form_photo')}
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors">
                <Upload className="w-4 h-4 text-indigo-400" />
                Choose Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>

              {photoPreview && (
                <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-700">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* GPS Coordinates */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {t('report_form_location')}
              </span>
              <button
                type="button"
                onClick={handleFetchLocation}
                disabled={fetchingGps}
                className="px-3 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Navigation className={`w-3.5 h-3.5 ${fetchingGps ? 'animate-spin' : ''}`} />
                {fetchingGps ? t('report_form_gps_fetching') : t('report_form_gps_btn')}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">{t('report_form_lat')}</label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">{t('report_form_lng')}</label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Bot className="w-5 h-5 animate-spin" />
                {t('report_form_submitting')}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {t('report_form_submit')}
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
