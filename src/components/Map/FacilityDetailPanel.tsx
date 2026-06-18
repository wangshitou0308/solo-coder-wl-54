
import { useState, useMemo } from 'react';
import {
  X,
  MapPin,
  Clock,
  Users,
  AlertTriangle,
  Calendar,
  Wrench,
  Trash2,
  Navigation,
  Copy,
  Check,
  ChevronRight,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import {
  facilityTypeLabels,
  facilityStatusLabels,
  healthLevelColors,
  crowdDensityLabels,
  formatDateTime,
  calculateDistance,
  formatDistance,
  copyToClipboard,
  healthLevelLabels,
  facilityStatusBgColors,
} from '../../utils';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import type { FacilityWithDistance } from '../../types';

export default function FacilityDetailPanel() {
  const {
    selectedFacility,
    showDetailPanel,
    setShowDetailPanel,
    currentRole,
    userLocation,
    getNearbyFacilities,
    setSelectedFacility,
  } = useAppStore();
  const navigate = useNavigate();
  const [showNavModal, setShowNavModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [arrived, setArrived] = useState(false);

  if (!showDetailPanel || !selectedFacility) {
    return null;
  }

  const facility = selectedFacility;
  const progressPercentage = facility.currentLevel;

  const distance = useMemo(() => {
    if (!userLocation) return null;
    return calculateDistance(userLocation.lat, userLocation.lng, facility.lat, facility.lng);
  }, [userLocation, facility.lat, facility.lng]);

  const nearby = useMemo(() => getNearbyFacilities(facility.id, 5), [facility.id, getNearbyFacilities]);
  const availableAlternatives = nearby.filter(
    (f) => f.healthLevel === 'good' && f.status !== 'full'
  );
  const needAlternative =
    facility.healthLevel === 'danger' || facility.healthLevel === 'alert';

  const handleReport = () => {
    navigate('/report', { state: { facilityId: facility.id, facilityName: facility.name } });
  };

  const handleCopyAddress = async () => {
    const ok = await copyToClipboard(`${facility.district}${facility.address}`);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSelectNearby = (near: FacilityWithDistance) => {
    setSelectedFacility(near);
  };

  return (
    <>
      <div className="absolute top-16 right-4 w-80 bg-white rounded-xl shadow-panel z-[1000] animate-slide-in-right overflow-hidden">
        <div
          className="h-2"
          style={{ backgroundColor: healthLevelColors[facility.healthLevel] }}
        />

        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-2">
              <h3 className="text-lg font-bold text-smoke-800 leading-tight">{facility.name}</h3>
              <p className="text-sm text-smoke-500 mt-1 font-mono">{facility.code}</p>
            </div>
            <button
              onClick={() => setShowDetailPanel(false)}
              className="p-1 rounded-full hover:bg-smoke-100 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-smoke-400" />
            </button>
          </div>

          {distance !== null && (
            <div className="mb-3 p-2.5 bg-brand-accent/5 rounded-lg border border-brand-accent/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-brand-accent" />
                <span className="text-sm font-medium text-brand-accent">
                  约 {formatDistance(distance)}
                </span>
              </div>
              {currentRole === 'cleaner' && (
                <button
                  onClick={() => setShowNavModal(true)}
                  className="px-2.5 py-1 bg-brand-accent text-white text-xs rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  导航
                </button>
              )}
            </div>
          )}

          <div className="space-y-2.5 mb-4">
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-smoke-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-smoke-600 block">{facility.address}</span>
                <span className="text-xs text-smoke-400">{facility.district}</span>
              </div>
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

          <div className="mb-4 p-3 bg-smoke-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-smoke-700">烟蒂容量</span>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    facilityStatusBgColors[facility.status]
                  )}
                >
                  {facilityStatusLabels[facility.status]}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{ color: healthLevelColors[facility.healthLevel] }}
                >
                  {healthLevelLabels[facility.healthLevel]}
                </span>
              </div>
            </div>
            <div className="h-3 bg-white rounded-full overflow-hidden border border-smoke-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: healthLevelColors[facility.healthLevel],
                }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-smoke-400">
              <span>0%</span>
              <span className="font-medium text-smoke-600">{progressPercentage}%</span>
              <span>100%</span>
            </div>
            <p className="text-xs text-smoke-400 mt-1.5">
              总容量：{facility.capacity.toLocaleString()} 个 · 已用约 {Math.floor(facility.capacity * progressPercentage / 100).toLocaleString()} 个
            </p>
          </div>

          <div className="flex gap-2 mb-4 flex-wrap">
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
            {facility.isActive === false && (
              <span className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-full">
                已停用
              </span>
            )}
          </div>

          {needAlternative && availableAlternatives.length > 0 && (
            <div className="mb-4 p-3 bg-health-warning/10 rounded-lg border border-health-warning/20">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-health-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-health-warning">设施已{facility.healthLevel === 'danger' ? '满' : '告警'}</p>
                  <p className="text-xs text-smoke-500 mt-0.5">推荐附近可用设施</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {availableAlternatives.slice(0, 3).map((alt) => (
                  <button
                    key={alt.id}
                    onClick={() => handleSelectNearby(alt)}
                    className="w-full flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-smoke-50 transition-colors text-left group"
                  >
                    <MapPin className="w-4 h-4 text-health-good flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-smoke-700 truncate group-hover:text-brand-accent">
                        {alt.name}
                      </p>
                      <p className="text-[10px] text-smoke-400">
                        {facilityStatusLabels[alt.status]} · {formatDistance(alt.distance ?? 0)}
                      </p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-smoke-300 group-hover:text-brand-accent" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {!needAlternative && nearby.length > 0 && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-health-good" />
                <p className="text-sm font-medium text-smoke-700">附近设施</p>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {nearby.slice(0, 4).map((near) => (
                  <button
                    key={near.id}
                    onClick={() => handleSelectNearby(near)}
                    className={cn(
                      'w-full flex items-center gap-2 p-1.5 rounded hover:bg-white transition-colors text-left group',
                      near.healthLevel === 'danger' && 'opacity-60'
                    )}
                  >
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full flex-shrink-0',
                        near.healthLevel === 'danger' ? 'bg-health-danger' :
                        near.healthLevel === 'alert' ? 'bg-health-alert' :
                        near.healthLevel === 'warning' ? 'bg-health-warning' : 'bg-health-good'
                      )}
                    />
                    <span className="text-xs text-smoke-600 truncate flex-1 group-hover:text-brand-accent">
                      {near.name}
                    </span>
                    <span className="text-[10px] text-smoke-400 flex-shrink-0">
                      {formatDistance(near.distance ?? 0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {currentRole === 'citizen' && (
              <button
                onClick={handleReport}
                className="flex-1 py-2.5 bg-health-danger text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                上报问题
              </button>
            )}

            {currentRole === 'cleaner' && (
              <>
                <button
                  onClick={() => setShowNavModal(true)}
                  className="flex-1 py-2.5 bg-brand-accent text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  导航前往
                </button>
                <button
                  className="flex-1 py-2.5 bg-health-good text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  更新状态
                </button>
              </>
            )}

            {currentRole === 'admin' && (
              <button
                onClick={() => navigate('/facilities', { state: { facilityId: facility.id } })}
                className="flex-1 py-2.5 bg-smoke-700 text-white rounded-lg font-medium hover:bg-smoke-800 transition-colors flex items-center justify-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                设施管理
              </button>
            )}
          </div>
        </div>
      </div>

      {showNavModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            setShowNavModal(false);
            setArrived(false);
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-bounce-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-smoke-100 bg-gradient-to-br from-brand-accent to-brand-accent/80 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">导航到设施</h2>
                  <p className="text-white/80 text-sm mt-1">{facility.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowNavModal(false);
                    setArrived(false);
                  }}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {distance !== null && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-end gap-4">
                    <div>
                      <p className="text-3xl font-bold">{formatDistance(distance)}</p>
                      <p className="text-white/70 text-sm mt-0.5">
                        步行约 {Math.max(1, Math.ceil((distance * 1000) / 80))} 分钟
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-end">
                      <div className="bg-white/20 rounded-full p-2.5">
                        <Navigation className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-smoke-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-health-danger flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-smoke-400 mb-1">目标地址</p>
                    <p className="text-sm font-medium text-smoke-800">
                      {facility.district}
                    </p>
                    <p className="text-sm text-smoke-600">{facility.address}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyAddress}
                  className={cn(
                    'flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2',
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-smoke-100 text-smoke-700 hover:bg-smoke-200'
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制地址
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setArrived(true);
                  }}
                  className={cn(
                    'flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2',
                    arrived
                      ? 'bg-green-100 text-green-700'
                      : 'bg-health-good text-white hover:bg-green-600'
                  )}
                >
                  <Check className="w-4 h-4" />
                  {arrived ? '已到达' : '标记已到达'}
                </button>
              </div>

              {arrived && (
                <div className="animate-fade-in p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    已标记到达，开始作业处理
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowNavModal(false);
                    setArrived(false);
                  }}
                  className="w-full py-2.5 bg-smoke-100 text-smoke-700 rounded-lg font-medium hover:bg-smoke-200 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
