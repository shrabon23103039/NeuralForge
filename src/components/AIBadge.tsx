'use client';

import { useI18n } from '@/lib/i18n/context';
import { Department, Severity } from '@/types/database';
import { AlertTriangle, Bot, CheckCircle2, ShieldAlert } from 'lucide-react';
import React from 'react';

interface AIBadgeProps {
  category: string;
  severity: Severity;
  targetDepartment: Department;
  isValid?: boolean;
}

export const AIBadge: React.FC<AIBadgeProps> = ({
  severity,
  targetDepartment,
  isValid = true,
}) => {
  const { t } = useI18n();

  const getSeverityStyle = (sev: Severity) => {
    switch (sev) {
      case 'high':
        return 'bg-red-950/70 border-red-500/50 text-red-300';
      case 'medium':
        return 'bg-amber-950/70 border-amber-500/50 text-amber-300';
      default:
        return 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300';
    }
  };

  const getDeptText = (dept: Department) => {
    switch (dept) {
      case 'police':
        return t('dept_police');
      case 'disaster_management':
        return t('dept_disaster_management');
      default:
        return t('dept_city_corporation');
    }
  };

  return (
    <div className="inline-flex flex-wrap items-center gap-2 text-xs">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-400/40 text-blue-200 font-semibold shadow-sm backdrop-blur-md">
        <Bot className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
        {isValid ? t('ai_badge_title') : t('ai_badge_fake')}
      </span>

      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border font-medium ${getSeverityStyle(severity)}`}>
        {severity === 'high' ? (
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        )}
        {t(`severity_${severity}`)}
      </span>

      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        {getDeptText(targetDepartment)}
      </span>
    </div>
  );
};
