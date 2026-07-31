'use client';

import { useI18n } from '@/lib/i18n/context';
import { HotspotCell, Report, SOSAlert } from '@/types/database';
import L from 'leaflet';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { AIBadge } from './AIBadge';

interface MapInnerProps {
  reports: Report[];
  hotspots?: HotspotCell[];
  sosAlerts?: SOSAlert[];
}

// Custom Leaflet Pin Icons
const createCustomIcon = (color: string, label: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z" fill="${color}" stroke="#0f172a" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="#ffffff"/>
    </svg>
  `;
  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: svg,
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -40],
  });
};

const highIcon = createCustomIcon('#ef4444', 'H');
const mediumIcon = createCustomIcon('#f59e0b', 'M');
const lowIcon = createCustomIcon('#10b981', 'L');

const getMarkerIcon = (severity: string) => {
  if (severity === 'high') return highIcon;
  if (severity === 'medium') return mediumIcon;
  return lowIcon;
};

const sosPulsingIcon = L.divIcon({
  className: 'sos-leaflet-marker',
  html: '<div class="pulsing-sos-marker"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export const MapInner: React.FC<MapInnerProps> = ({ reports, hotspots = [], sosAlerts = [] }) => {
  const { lang, t } = useI18n();
  const dhakaCenter: [number, number] = [23.777176, 90.399452];

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <MapContainer
        center={dhakaCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[450px] z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Heatmap Risk Circles */}
        {hotspots.map(spot => {
          const color = spot.risk_score > 60 ? '#ef4444' : spot.risk_score > 30 ? '#f59e0b' : '#10b981';
          const radius = Math.max(120, spot.report_count * 90);

          return (
            <Circle
              key={spot.id}
              center={[spot.cell_lat, spot.cell_lng]}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.25,
                weight: 2,
              }}
            >
              <Popup>
                <div className="p-2 text-slate-100 max-w-xs">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-sm text-white">
                      Risk Score: <span style={{ color }}>{spot.risk_score}/100</span>
                    </span>
                    <span className="text-xs text-slate-400">({spot.report_count} reports)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-snug">
                    {lang === 'bn' ? spot.caption_bn : spot.caption_en}
                  </p>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Report Marker Pins */}
        {reports.map(report => (
          <Marker
            key={report.id}
            position={[report.lat, report.lng]}
            icon={getMarkerIcon(report.severity)}
          >
            <Popup>
              <div className="p-2 max-w-xs text-slate-100">
                <div className="mb-2">
                  <AIBadge
                    category={report.category}
                    severity={report.severity}
                    targetDepartment={report.target_department}
                    isValid={report.ai_is_valid}
                  />
                </div>
                <h4 className="font-bold text-sm text-white capitalize mb-1">
                  {report.category.replace('_', ' ')}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                  {lang === 'bn' && report.ai_summary_bn ? report.ai_summary_bn : report.description}
                </p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700">
                  <span className="text-emerald-400 font-semibold">
                    👍 {report.confirm_count || 0} {t('verified_by_citizens')}
                  </span>
                  <Link
                    href={`/reports/${report.id}`}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Live SOS Alerts Markers */}
        {sosAlerts
          .filter(s => s.status === 'active')
          .map(sos => (
            <Marker key={sos.id} position={[sos.lat, sos.lng]} icon={sosPulsingIcon}>
              <Popup>
                <div className="p-2 text-red-400 font-bold text-xs">
                  ⚠️ ACTIVE SOS EMERGENCY PING
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};
