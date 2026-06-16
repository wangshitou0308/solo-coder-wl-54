
import { X, MapPin, Clock, Users, AlertTriangle, Calendar, Wrench, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { facilityTypeLabels, facilityStatusLabels, healthLevelColors, crowdDensityLabels, formatDateTime } from '../../utils';
import { useNavigate } from 'react-router-dom';

export default function FacilityDetailPanel() {
  const { selectedFacility, showDetailPanel, setShowDetailPanel, currentRole } = useAppStore();
  const navigate = useNavigate();

  if (!showDetailPanel || !selectedFacility) {
    return null;
  }

  const facility = selectedFacility;
  const progressPercentage = facility.currentLevel;

  const handleReport = () => {
    navigate('/report', { state: { facilityId: facility.id, facilityName: facility.name } });
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-white rounded-xl shadow-panel z-[1000] animate-slide-in-right overflow-hidden">
      <div 
        className="h-2"
        style={{ backgroundColor: healthLevelColors[facility.healthLevel] }}
      />
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-smoke-800">{facility.name}</h3>
            <p className="text-sm text-smoke-500 mt-1">{facility.code}</p>
          </div>
          <button
            onClick={() => setShowDetailPanel(false)}
            className="p-1 rounded-full hover:bg-smoke-100 transition-colors"
          >
            <X className="w-5 h-5 text-smoke-400" />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="w-4 h-4 text-smoke-400" />
            <span className="text-smoke-600">{facility.address}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Trash2 className="w-4 h-4 text-smoke-400" />
            <span className="text-smoke-600">{facilityTypeLabels[facility.type]}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-smoke-400" />
            <span className="text-smoke-600">上次清理：{formatDateTime(facility.lastCleanTime)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Users className="w-4 h-4 text-smoke-400" />
            <span className="text-smoke-600">人流密度：{crowdDensityLabels[facility.crowdDensity]}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-smoke-400" />
            <span className="text-smoke-600">维护日期：{facility.maintenanceDate}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-smoke-600">烟蒂容量</span>
            <span 
              className="text-sm font-bold"
              style={{ color: healthLevelColors[facility.healthLevel] }}
            >
              {facilityStatusLabels[facility.status]}
            </span>
          </div>
          <div className="h-3 bg-smoke-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: healthLevelColors[facility.healthLevel]
              }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-smoke-400">
            <span>0%</span>
            <span>{progressPercentage}%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {facility.hasAshtray && (
            <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">
              烟灰缸
            </span>
          )}
          {facility.hasTrashBin && (
            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
              垃圾桶
            </span>
          )}
          <span className="px-2 py-1 bg-smoke-50 text-smoke-600 text-xs rounded-full">
            容量 {facility.capacity}个
          </span>
        </div>

        {currentRole === 'citizen' && (
          <button
            onClick={handleReport}
            className="w-full py-2.5 bg-health-danger text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            上报问题
          </button>
        )}

        {currentRole === 'cleaner' && (
          <button
            className="w-full py-2.5 bg-health-good text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            更新状态
          </button>
        )}
      </div>
    </div>
  );
}
