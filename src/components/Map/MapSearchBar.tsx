
import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Navigation } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { facilityStatusLabels, facilityTypeLabels, healthLevelColors, formatDistance } from '../../utils';
import type { FacilityWithDistance } from '../../types';
import { cn } from '../../lib/utils';

export default function MapSearchBar() {
  const {
    searchFacilities,
    setSelectedFacility,
    setShowDetailPanel,
    currentRole,
    mapSearchKeyword,
    setMapSearchKeyword,
    userLocation,
    getNearbyFacilities,
  } = useAppStore();

  const [showResults, setShowResults] = useState(false);
  const [keyword, setKeyword] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = keyword.trim() ? searchFacilities(keyword) : [];
  const topFacilities: FacilityWithDistance[] = (() => {
    if (keyword.trim() || results.length > 0) return [];
    const nearId = userLocation ? (userLocation.lat + userLocation.lng).toString() : null;
    if (!nearId) return [];
    return [];
  })();

  useEffect(() => {
    setKeyword(mapSearchKeyword);
  }, [mapSearchKeyword]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (facility: FacilityWithDistance) => {
    setSelectedFacility(facility);
    setShowDetailPanel(true);
    setShowResults(false);
    setMapSearchKeyword(facility.name);
    setKeyword(facility.name);
  };

  const handleClear = () => {
    setKeyword('');
    setMapSearchKeyword('');
    inputRef.current?.focus();
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-4">
      <div className="relative" ref={resultsRef}>
        <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-xl shadow-panel overflow-hidden border border-smoke-100">
          <div className="pl-4 pr-2 flex items-center text-smoke-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setMapSearchKeyword(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="搜索设施名称、编号或地址..."
            className="flex-1 py-3 pr-2 bg-transparent outline-none text-sm text-smoke-800 placeholder:text-smoke-400"
          />
          {keyword && (
            <button
              onClick={handleClear}
              className="p-2 text-smoke-400 hover:text-smoke-600 transition-colors mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="hidden sm:block px-3 py-1.5 m-2 bg-brand-accent/10 text-brand-accent rounded-lg text-xs font-medium">
            {currentRole === 'citizen' ? '市民地图' : currentRole === 'cleaner' ? '保洁导航' : '设施监控'}
          </div>
        </div>

        {showResults && (keyword.trim() || topFacilities.length > 0) && (
          <div className="mt-2 bg-white rounded-xl shadow-panel overflow-hidden border border-smoke-100 animate-fade-in max-h-[420px] overflow-y-auto">
            {results.length === 0 && !keyword.trim() ? (
              topFacilities.length > 0 ? (
                <div>
                  <div className="px-4 py-2 bg-smoke-50 border-b border-smoke-100">
                    <p className="text-xs font-medium text-smoke-500 flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      附近推荐
                    </p>
                  </div>
                  {topFacilities.map((f) => (
                    <FacilityResultItem
                      key={f.id}
                      facility={f}
                      onClick={() => handleSelect(f)}
                    />
                  ))}
                </div>
              ) : null
            ) : results.length === 0 ? (
              <div className="py-8 text-center">
                <MapPin className="w-8 h-8 text-smoke-300 mx-auto mb-2" />
                <p className="text-sm text-smoke-400">未找到匹配的设施</p>
                <p className="text-xs text-smoke-300 mt-1">试试其他关键词？</p>
              </div>
            ) : (
              <div>
                <div className="px-4 py-2 bg-smoke-50 border-b border-smoke-100">
                  <p className="text-xs font-medium text-smoke-500">
                    找到 {results.length} 个匹配设施
                  </p>
                </div>
                {results.map((f) => (
                  <FacilityResultItem
                    key={f.id}
                    facility={f}
                    onClick={() => handleSelect(f)}
                    matchKeyword={keyword}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FacilityResultItem({
  facility,
  onClick,
  matchKeyword,
}: {
  facility: FacilityWithDistance;
  onClick: () => void;
  matchKeyword?: string;
}) {
  const highlight = (text: string, kw?: string) => {
    if (!kw) return text;
    const idx = text.toLowerCase().indexOf(kw.toLowerCase());
    if (idx < 0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="bg-health-warning/30 text-smoke-800 font-medium">
          {text.slice(idx, idx + kw.length)}
        </span>
        {text.slice(idx + kw.length)}
      </>
    );
  };

  return (
    <button
      onClick={onClick}
      className="w-full p-3 text-left hover:bg-smoke-50 transition-colors flex items-center gap-3 border-b border-smoke-50 last:border-b-0"
    >
      <div
        className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white shadow-sm"
        style={{ backgroundColor: healthLevelColors[facility.healthLevel] }}
      >
        <MapPin className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-medium text-smoke-800 truncate">
            {highlight(facility.name, matchKeyword)}
          </p>
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white flex-shrink-0"
            style={{ backgroundColor: healthLevelColors[facility.healthLevel] }}
          >
            {facilityStatusLabels[facility.status]}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-smoke-400">
          <span className="font-mono">{highlight(facility.code, matchKeyword)}</span>
          <span>·</span>
          <span className="truncate">{highlight(facility.address, matchKeyword)}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs">
          <span className="text-smoke-500">{facilityTypeLabels[facility.type]}</span>
          {facility.distance !== undefined && (
            <span className="text-brand-accent font-medium flex items-center gap-0.5">
              <Navigation className="w-3 h-3" />
              {formatDistance(facility.distance)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
