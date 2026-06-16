
import { X, Filter, MapPin, Trash2, Activity, SortAsc } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { getDistricts } from '../../data/facilities';
import { facilityTypeLabels, facilityStatusLabels } from '../../utils';
import type { FacilityType, FacilityStatus } from '../../types';

interface FilterPanelProps {
  onClose?: () => void;
}

export default function FilterPanel({ onClose }: FilterPanelProps) {
  const { filterOptions, setFilterOptions, showFilterPanel, toggleFilterPanel, getFilteredFacilities } = useAppStore();
  const districts = getDistricts();
  const filteredCount = getFilteredFacilities().length;

  const types: FacilityType[] = ['indoor_room', 'outdoor_pavilion', 'standalone_pillar'];
  const statuses: FacilityStatus[] = ['empty', 'half', 'nearly_full', 'full'];

  const toggleDistrict = (district: string) => {
    const current = filterOptions.district;
    const next = current.includes(district)
      ? current.filter((d) => d !== district)
      : [...current, district];
    setFilterOptions({ district: next });
  };

  const toggleType = (type: FacilityType) => {
    const current = filterOptions.type;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setFilterOptions({ type: next });
  };

  const toggleStatus = (status: FacilityStatus) => {
    const current = filterOptions.status;
    const next = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    setFilterOptions({ status: next });
  };

  const clearAll = () => {
    setFilterOptions({
      district: [],
      type: [],
      status: [],
      sortBy: 'distance',
    });
  };

  const statusColors: Record<FacilityStatus, string> = {
    empty: 'bg-health-good',
    half: 'bg-health-warning',
    nearly_full: 'bg-health-alert',
    full: 'bg-health-danger',
  };

  if (!showFilterPanel) {
    return (
      <button
        onClick={toggleFilterPanel}
        className="absolute top-4 left-4 z-[1000] p-3 bg-white rounded-lg shadow-card hover:shadow-card-hover transition-shadow transition-all z-10"
      >
        <Filter className="w-5 h-5 text-smoke-600" />
      </button>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-[1000] w-72 bg-white rounded-xl shadow-panel animate-slide-in-left overflow-hidden">
      <div className="p-4 border-b border-smoke-100 flex items-center justify-between">
        <h3 className="font-bold text-smoke-800 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          筛选条件
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={clearAll}
            className="text-xs text-brand-accent hover:underline"
          >
            清空
          </button>
          <button
            onClick={() => {
              toggleFilterPanel();
              onClose?.();
            }}
            className="p-1 rounded-full hover:bg-smoke-100 transition-colors"
          >
            <X className="w-4 h-4 text-smoke-400" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5 max-h-[calc(100vh-120px)] overflow-y-auto">
        <div>
          <h4 className="text-sm font-medium text-smoke-700 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-smoke-400" />
            所在区域
          </h4>
          <div className="flex flex-wrap gap-2">
            {districts.map((district) => (
              <button
                key={district}
                onClick={() => toggleDistrict(district)}
                className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                  filterOptions.district.includes(district)
                    ? 'bg-brand-accent text-white'
                    : 'bg-smoke-100 text-smoke-600 hover:bg-smoke-200'
                }`}
              >
                {district}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-smoke-700 mb-2 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-smoke-400" />
            设施类型
          </h4>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                  filterOptions.type.includes(type)
                    ? 'bg-brand-accent text-white'
                    : 'bg-smoke-100 text-smoke-600 hover:bg-smoke-200'
                }`}
              >
                {facilityTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-smoke-700 mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-smoke-400" />
            容量状态
          </h4>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`px-3 py-1.5 text-xs rounded-full transition-all flex items-center gap-1.5 ${
                  filterOptions.status.includes(status)
                    ? 'ring-2 ring-offset-1 ring-brand-accent'
                    : ''
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
                {facilityStatusLabels[status]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-smoke-700 mb-2 flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-smoke-400" />
            排序方式
          </h4>
          <div className="flex gap-2">
            {[
              { value: 'distance', label: '距离最近' },
              { value: 'name', label: '名称排序' },
              { value: 'status', label: '状态优先' },
            ].map((sort) => (
              <button
                key={sort.value}
                onClick={() => setFilterOptions({ sortBy: sort.value as any })}
                className={`flex-1 py-1.5 text-xs rounded-lg transition-all ${
                  filterOptions.sortBy === sort.value
                    ? 'bg-brand-accent text-white'
                    : 'bg-smoke-100 text-smoke-600 hover:bg-smoke-200'
                }`}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-smoke-100 bg-smoke-50">
        <p className="text-xs text-smoke-500 text-center">
          已筛选出 <span className="font-bold text-brand-accent">
            {filteredCount}
          </span> 个设施
        </p>
      </div>
    </div>
  );
}
