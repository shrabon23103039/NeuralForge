'use client';

import { ReportForm } from '@/components/ReportForm';
import { useI18n } from '@/lib/i18n/context';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function ReportPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-4">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('back_to_map')}
      </Link>

      <ReportForm />
    </div>
  );
}
