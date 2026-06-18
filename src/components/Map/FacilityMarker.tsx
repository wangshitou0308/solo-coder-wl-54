
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Facility } from '../../types';
import { healthLevelColors, facilityTypeLabels, facilityStatusLabels, formatDateTime, formatDistance, calculateDistance } from '../../utils';
import { useAppStore } from '../../store/appStore';

interface FacilityMarkerProps {
  facility: Facility;
  onClick?: () => void;
  isHighlighted?: boolean;
  hasWorkOrder?: boolean;
  forceTop?: boolean;
}

function createCustomIcon(
  facility: Facility,
  isHighlighted: boolean = false,
  forceTop: boolean = false
): L.DivIcon {
  const color = healthLevelColors[facility.healthLevel];
  const isDanger = facility.healthLevel === 'danger';
  const size = isHighlighted ? 52 : forceTop ? 56 : 40;
  const ringSize = isHighlighted ? 76 : forceTop ? 80 : 0;

  const ringHtml =
    isHighlighted || forceTop
      ? `<div class="absolute rounded-full animate-pulse-ring" style="background-color: #3498DB; opacity: 0.25; width: ${ringSize}px; height: ${ringSize}px; left: 50%; top: 50%; transform: translate(-50%, -50%);"></div>
         <div class="absolute rounded-full animate-pulse-ring-delay" style="background-color: #3498DB; opacity: 0.35; width: ${ringSize - 12}px; height: ${ringSize - 12}px; left: 50%; top: 50%; transform: translate(-50%, -50%);"></div>`
      : isDanger
      ? `<div class="absolute rounded-full animate-pulse-ring" style="background-color: ${color}; opacity: 0.5; width: 56px; height: 56px; left: 50%; top: 50%; transform: translate(-50%, -50%);"></div>`
      : '';

  const borderColor = isHighlighted || forceTop ? '#3498DB' : '#ffffff';
  const borderWidth = isHighlighted || forceTop ? 3 : 2;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative" style="width: ${size}px; height: ${size}px;">
        ${ringHtml}
        <div 
          class="rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 z-10 relative"
          style="width: ${size}px; height: ${size}px; background-color: ${color}; border: ${borderWidth}px solid ${borderColor}; box-shadow: 0 4px 12px rgba(0,0,0,0.25) ${isHighlighted || forceTop ? ', 0 0 0 4px rgba(52,152,219,0.2)' : ''};"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${getIconPath(facility.type)}
          </svg>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
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

export default function FacilityMarker({
  facility,
  onClick,
  isHighlighted = false,
  hasWorkOrder = false,
  forceTop = false,
}: FacilityMarkerProps) {
  const { setSelectedFacility, setShowDetailPanel, userLocation } = useAppStore();
  const icon = createCustomIcon(facility, isHighlighted, forceTop);

  const handleClick = () => {
    setSelectedFacility(facility);
    setShowDetailPanel(true);
    onClick?.();
  };

  const distance = userLocation
    ? formatDistance(calculateDistance(userLocation.lat, userLocation.lng, facility.lat, facility.lng))
    : null;

  return (
    <Marker
      position={[facility.lat, facility.lng]}
      icon={icon}
      eventHandlers={{ click: handleClick }}
      zIndexOffset={forceTop ? 10000 : isHighlighted ? 5000 : 0}
    >
      <Popup>
        <div className="p-2 min-w-[220px]">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-smoke-800 leading-tight">{facility.name}</h3>
            {hasWorkOrder && !forceTop && (
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-health-danger animate-pulse" title="有异常/告警" />
            )}
          </div>
          <div className="space-y-1.5 text-sm text-smoke-600">
            <p>
              <span className="text-smoke-400">编号：</span>
              <span className="font-mono">{facility.code}</span>
            </p>
            <p>
              <span className="text-smoke-400">类型：</span>
              {facilityTypeLabels[facility.type]}
            </p>
            <p className="flex items-center gap-2">
              <span className="text-smoke-400">状态：</span>
              <span
                className="px-2 py-0.5 rounded text-xs font-medium text-white"
                style={{ backgroundColor: healthLevelColors[facility.healthLevel] }}
              >
                {facilityStatusLabels[facility.status]} · {facility.currentLevel}%
              </span>
            </p>
            <p>
              <span className="text-smoke-400">地址：</span>
              <span className="text-xs">{facility.district} {facility.address}</span>
            </p>
            {distance && (
              <p className="text-xs text-brand-accent font-medium">
                距离约 {distance}
              </p>
            )}
            <p className="text-xs text-smoke-400">
              上次清理：{formatDateTime(facility.lastCleanTime)}
            </p>
          </div>
          <button
            onClick={handleClick}
            className="mt-3 w-full py-1.5 bg-brand-accent text-white text-sm rounded-lg hover:bg-brand-accent/90 transition-colors"
          >
            查看详情
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
