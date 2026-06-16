
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import { useAppStore } from '../../store/appStore';
import FacilityMarker from './FacilityMarker';
import FilterPanel from './FilterPanel';
import FacilityDetailPanel from './FacilityDetailPanel';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

const center: [number, number] = [39.9, 116.4];
const zoom = 12;

function MapController() {
  const { selectedFacility } = useAppStore();
  const map = useMap();

  useEffect(() => {
    if (selectedFacility) {
      map.setView([selectedFacility.lat, selectedFacility.lng], 15, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [selectedFacility, map]);

  return null;
}

interface MapViewProps {
  showFilters?: boolean;
}

export default function MapView({ showFilters = true }: MapViewProps) {
  const { getFilteredFacilities } = useAppStore();

  const filteredFacilities = getFilteredFacilities();

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <MapController />
        
        {filteredFacilities.map((facility) => (
          <FacilityMarker key={facility.id} facility={facility} />
        ))}
      </MapContainer>

      {showFilters && <FilterPanel />}
      <FacilityDetailPanel />

      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-card">
        <h4 className="text-xs font-medium text-smoke-700 mb-2">图例</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-smoke-600">
            <span className="w-3 h-3 rounded-full bg-health-good" />
            <span>空/半满（正常）</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-smoke-600">
            <span className="w-3 h-3 rounded-full bg-health-warning" />
            <span>将满（注意）</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-smoke-600">
            <span className="w-3 h-3 rounded-full bg-health-alert" />
            <span>将满（警告）</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-smoke-600">
            <span className="w-3 h-3 rounded-full bg-health-danger animate-pulse" />
            <span>已满（告警）</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-16 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-card">
        <h4 className="text-xs font-medium text-smoke-700 mb-2">设施类型</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-smoke-600">
            <span className="w-6 h-6 rounded bg-smoke-600 flex items-center justify-center text-white">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
              </svg>
            </span>
            <span>室内吸烟室</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-smoke-600">
            <span className="w-6 h-6 rounded bg-smoke-600 flex items-center justify-center text-white">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </span>
            <span>室外吸烟亭</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-smoke-600">
            <span className="w-6 h-6 rounded bg-smoke-600 flex items-center justify-center text-white">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18"/>
                <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </span>
            <span>独立烟蒂柱</span>
          </div>
        </div>
      </div>
    </div>
  );
}
