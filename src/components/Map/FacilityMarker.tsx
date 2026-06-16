
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Building2, Umbrella, Trash2 } from 'lucide-react';
import type { Facility } from '../../types';
import { healthLevelColors, facilityTypeLabels, facilityStatusLabels, formatDateTime } from '../../utils';
import { useAppStore } from '../../store/appStore';

interface FacilityMarkerProps {
  facility: Facility;
  onClick?: () => void;
}

function createCustomIcon(facility: Facility): L.DivIcon {
  const color = healthLevelColors[facility.healthLevel];
  const isDanger = facility.healthLevel === 'danger';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        ${isDanger ? `<div class="absolute -inset-2 rounded-full animate-pulse-ring" style="background-color: ${color}; opacity: 0.6;"></div>` : ''}
        <div 
          class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white transition-transform hover:scale-110"
          style="background-color: ${color};"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${getIconPath(facility.type)}
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
}

function getIconPath(type: Facility['type']): string {
  switch (type) {
    case 'indoor_room':
      return '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>';
    case 'outdoor_pavilion':
      return '<path d="M12 2v20"/><path d="M2 12h20"/><path d="m4.93 4.93 14.14 14.14"/><path d="m19.07 4.93-14.14 14.14"/><circle cx="12" cy="12" r="10"/>';
    case 'standalone_pillar':
    default:
      return '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>';
  }
}

export default function FacilityMarker({ facility, onClick }: FacilityMarkerProps) {
  const { setSelectedFacility, setShowDetailPanel } = useAppStore();
  const icon = createCustomIcon(facility);

  const handleClick = () => {
    setSelectedFacility(facility);
    setShowDetailPanel(true);
    onClick?.();
  };

  return (
    <Marker
      position={[facility.lat, facility.lng]}
      icon={icon}
      eventHandlers={{ click: handleClick }}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <h3 className="font-bold text-smoke-800 mb-2">{facility.name}</h3>
          <div className="space-y-1 text-sm text-smoke-600">
            <p>
              <span className="text-smoke-400">编号：</span>
              {facility.code}
            </p>
            <p>
              <span className="text-smoke-400">类型：</span>
              {facilityTypeLabels[facility.type]}
            </p>
            <p>
              <span className="text-smoke-400">状态：</span>
              <span
                className="px-2 py-0.5 rounded text-xs font-medium text-white"
                style={{ backgroundColor: healthLevelColors[facility.healthLevel] }}
              >
                {facilityStatusLabels[facility.status]}
              </span>
            </p>
            <p>
              <span className="text-smoke-400">上次清理：</span>
              {formatDateTime(facility.lastCleanTime)}
            </p>
          </div>
          <button
            onClick={handleClick}
            className="mt-3 w-full py-1.5 bg-brand-accent text-white text-sm rounded hover:bg-brand-accent/90 transition-colors"
          >
            查看详情
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
