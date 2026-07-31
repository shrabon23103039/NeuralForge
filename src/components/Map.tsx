'use client';

import { HotspotCell, Report, SOSAlert } from '@/types/database';
import dynamic from 'next/dynamic';
import React from 'react';

const MapInner = dynamic(
  () => import('./MapInner').then(mod => mod.MapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[450px] bg-slate-900 animate-pulse rounded-2xl flex flex-col items-center justify-center border border-slate-800 text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-3"></div>
        <p className="text-sm font-medium">Loading Dhaka Interactive Map...</p>
      </div>
    ),
  }
);

interface MapProps {
  reports: Report[];
  hotspots?: HotspotCell[];
  sosAlerts?: SOSAlert[];
}

export const Map: React.FC<MapProps> = (props) => {
  return <MapInner {...props} />;
};
