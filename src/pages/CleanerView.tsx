
import { useState } from 'react';
import {
  ClipboardList,
  CheckCircle,
  Clock,
  MapPin,
  Navigation,
  ChevronRight,
  Play,
  Check,
  Filter,
  X,
  Gauge,
  MessageSquare,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import {
  workOrderTypeLabels,
  workOrderStatusLabels,
  workOrderPriorityLabels,
  workOrderPriorityColors,
  workOrderStatusColors,
  formatDateTime,
  formatFullDateTime,
  facilityStatusLabels,
  facilityStatusColors,
  healthLevelColors,
  formatDistance,
  calculateDistance,
} from '../utils';
import type { WorkOrderStatus, FacilityStatus } from '../types';
import { cn } from '../lib/utils';
import MapView from '../components/Map/MapView';

const statusTabs: { value: WorkOrderStatus | 'all'; label: string; icon: typeof Clock }[] = [
  { value: 'pending', label: '待接单', icon: Clock },
  { value: 'processing', label: '进行中', icon: Play },
  { value: 'completed', label: '已完成', icon: CheckCircle },
];

const statusOptions: { value: FacilityStatus; label: string; defaultLevel: number }[] = [
  { value: 'empty', label: '已清空', defaultLevel: 10 },
  { value: 'half', label: '半满', defaultLevel: 40 },
  { value: 'nearly_full', label: '将满', defaultLevel: 65 },
  { value: 'full', label: '已满', defaultLevel: 90 },
];

export default function CleanerView() {
  const {
    workOrders,
    currentUser,
    acceptWorkOrder,
    completeWorkOrder,
    getFacilityById,
    setHighlightedFacilityId,
    userLocation,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<WorkOrderStatus | 'all'>('pending');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null);
  const [cleanerRemark, setCleanerRemark] = useState('');
  const [facilityStatusAfter, setFacilityStatusAfter] = useState<FacilityStatus>('empty');
  const [currentLevelAfter, setCurrentLevelAfter] = useState<number>(10);

  const myAssignedOrders = workOrders.filter((order) => order.cleanerId === currentUser?.id);

  const poolOrders = workOrders.filter(
    (order) => order.status === 'pending' || order.status === 'assigned'
  );

  const allMyOrders = [
    ...poolOrders.filter((o) => !myAssignedOrders.find((m) => m.id === o.id)),
    ...myAssignedOrders,
  ];

  const filteredOrders = allMyOrders.filter((order) => {
    if (activeTab !== 'all' && order.status !== activeTab) return false;
    return true;
  });

  const handleAcceptOrder = (orderId: string) => {
    acceptWorkOrder(orderId);
  };

  const handleOpenCompleteModal = (orderId: string) => {
    setShowCompleteModal(orderId);
    setCleanerRemark('');
    setFacilityStatusAfter('empty');
    setCurrentLevelAfter(10);
  };

  const handleStatusSelect = (status: FacilityStatus) => {
    setFacilityStatusAfter(status);
    const opt = statusOptions.find((s) => s.value === status);
    if (opt) setCurrentLevelAfter(opt.defaultLevel);
  };

  const handleConfirmComplete = () => {
    if (!showCompleteModal) return;
    completeWorkOrder(showCompleteModal, {
      cleanerRemark: cleanerRemark || '清理完成，设施已恢复正常',
      facilityStatusAfter,
      currentLevelAfter,
    });
    setShowCompleteModal(null);
    setCleanerRemark('');
  };

  const handleNavigate = (facilityId: string) => {
    const facility = getFacilityById(facilityId);
    if (facility) {
      setHighlightedFacilityId(facilityId);
      setViewMode('map');
    }
  };

  const getDistance = (facilityId: string) => {
    const facility = getFacilityById(facilityId);
    if (!facility || !userLocation) return null;
    return calculateDistance(userLocation.lat, userLocation.lng, facility.lat, facility.lng);
  };

  const pendingCount = poolOrders.length;
  const processingCount = myAssignedOrders.filter((o) => o.status === 'processing').length;
  const completedCount = myAssignedOrders.filter((o) => o.status === 'completed').length;

  const getTabCount = (status: WorkOrderStatus | 'all') => {
    if (status === 'all') return allMyOrders.length;
    if (status === 'pending')
      return poolOrders.filter((o) => o.status === 'pending' || o.status === 'assigned').length;
    if (status === 'processing') return myAssignedOrders.filter((o) => o.status === 'processing').length;
    if (status === 'completed') return myAssignedOrders.filter((o) => o.status === 'completed').length;
    return 0;
  };

  const completingOrder = showCompleteModal ? workOrders.find((o) => o.id === showCompleteModal) : null;
  const completingFacility = completingOrder ? getFacilityById(completingOrder.facilityId) : null;

  return (
    <div className="min-h-full bg-smoke-50">
      <div className="bg-white border-b border-smoke-100 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-smoke-800">保洁工作台</h1>
              <p className="text-sm text-smoke-500 mt-0.5">
                {currentUser?.name} · {currentUser?.district}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-smoke-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-md transition-all',
                    viewMode === 'list' ? 'bg-white text-smoke-800 shadow-sm' : 'text-smoke-500'
                  )}
                >
                  列表
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-md transition-all',
                    viewMode === 'map' ? 'bg-white text-smoke-800 shadow-sm' : 'text-smoke-500'
                  )}
                >
                  地图
                </button>
              </div>
              <button className="p-2 bg-smoke-100 rounded-lg hover:bg-smoke-200 transition-colors">
                <Filter className="w-5 h-5 text-smoke-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-700">待接单</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-700">进行中</p>
                  <p className="text-2xl font-bold text-orange-600">{processingCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-700">已完成</p>
                  <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex gap-2 mb-4">
            {statusTabs.map((tab) => {
              const Icon = tab.icon;
              const count = getTabCount(tab.value);
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    activeTab === tab.value
                      ? 'bg-brand-accent text-white shadow-md'
                      : 'bg-white text-smoke-600 hover:bg-smoke-50 shadow-card'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span
                    className={cn(
                      'px-1.5 py-0.5 text-xs rounded-full',
                      activeTab === tab.value ? 'bg-white/20' : 'bg-smoke-100'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl">
                <ClipboardList className="w-12 h-12 text-smoke-300 mx-auto mb-4" />
                <p className="text-smoke-500">暂无工单</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const dist = getDistance(order.facilityId);
                const facility = getFacilityById(order.facilityId);
                return (
                  <div
                    key={order.id}
                    className={cn(
                      'bg-white rounded-xl shadow-card transition-all overflow-hidden',
                      selectedOrder === order.id ? 'ring-2 ring-brand-accent' : ''
                    )}
                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                  >
                    <div className="p-5 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-medium text-smoke-800">{order.facilityName}</h3>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium',
                                workOrderStatusColors[order.status]
                              )}
                            >
                              {workOrderStatusLabels[order.status]}
                            </span>
                            <span
                              className="px-2 py-0.5 text-xs rounded text-white font-medium"
                              style={{ backgroundColor: workOrderPriorityColors[order.priority] }}
                            >
                              {workOrderPriorityLabels[order.priority]}
                            </span>
                            {dist !== null && (
                              <span className="px-2 py-0.5 bg-brand-accent/10 text-brand-accent text-xs rounded font-medium">
                                约{formatDistance(dist)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-smoke-500 font-mono mb-2">{order.orderNo}</p>
                          <div className="flex items-center gap-4 text-sm text-smoke-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {order.district}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatDateTime(order.createTime)}
                            </span>
                            <span className="px-2 py-0.5 bg-smoke-100 text-smoke-600 text-xs rounded">
                              {workOrderTypeLabels[order.type]}
                            </span>
                            {facility && (
                              <span
                                className="px-2 py-0.5 text-xs rounded font-medium text-white"
                                style={{ backgroundColor: healthLevelColors[facility.healthLevel] }}
                              >
                                设施：{facilityStatusLabels[facility.status]}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight
                          className={cn(
                            'w-5 h-5 text-smoke-300 transition-transform flex-shrink-0',
                            selectedOrder === order.id && 'rotate-90'
                          )}
                        />
                      </div>
                    </div>

                    {selectedOrder === order.id && (
                      <div className="px-5 pb-5 border-t border-smoke-100 pt-4 animate-fade-in">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-3 bg-smoke-50 rounded-lg">
                            <p className="text-xs text-smoke-400 mb-1 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              设施地址
                            </p>
                            <p className="text-sm text-smoke-700">
                              {facility?.district} {facility?.address}
                            </p>
                          </div>
                          <div className="p-3 bg-smoke-50 rounded-lg">
                            <p className="text-xs text-smoke-400 mb-1 flex items-center gap-1">
                              <Gauge className="w-3 h-3" />
                              当前容量
                            </p>
                            <p className="text-sm text-smoke-700">
                              {facility ? `${facility.currentLevel}% - ${facilityStatusLabels[facility.status]}` : '-'}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-smoke-600 mb-4 p-3 bg-smoke-50 rounded-lg">
                          <span className="text-xs text-smoke-400 block mb-1">问题描述：</span>
                          {order.description}
                        </p>

                        <div className="flex gap-3">
                          {(order.status === 'pending' || order.status === 'assigned') && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcceptOrder(order.id);
                                }}
                                className="flex-1 py-2.5 bg-brand-accent text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <Play className="w-4 h-4" />
                                接单处理
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNavigate(order.facilityId);
                                }}
                                className="py-2.5 px-4 bg-smoke-100 text-smoke-600 rounded-lg font-medium hover:bg-smoke-200 transition-colors flex items-center gap-2"
                              >
                                <Navigation className="w-4 h-4" />
                                导航
                              </button>
                            </>
                          )}
                          {order.status === 'processing' && order.cleanerId === currentUser?.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCompleteModal(order.id);
                              }}
                              className="flex-1 py-2.5 bg-health-good text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              完成清理
                            </button>
                          )}
                          {order.status === 'completed' && (
                            <div className="flex-1 py-2.5 bg-green-50 text-green-700 rounded-lg font-medium text-center flex items-center justify-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              已完成 {order.completeTime ? `于 ${formatFullDateTime(order.completeTime)}` : ''}
                            </div>
                          )}
                        </div>

                        {order.cleanerRemark && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                            <p className="text-xs text-green-600 mb-1 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              清理备注
                            </p>
                            <p className="text-sm text-green-800">{order.cleanerRemark}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-180px)]">
          <MapView showFilters={false} />
        </div>
      )}

      {showCompleteModal && completingOrder && completingFacility && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowCompleteModal(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-bounce-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-smoke-100 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-smoke-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-health-good" />
                  完成清理确认
                </h2>
                <p className="text-sm text-smoke-500 mt-1 font-mono">{completingOrder.orderNo}</p>
              </div>
              <button
                onClick={() => setShowCompleteModal(null)}
                className="p-1.5 rounded-full hover:bg-smoke-100 transition-colors"
              >
                <X className="w-5 h-5 text-smoke-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-4 bg-smoke-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-accent flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-smoke-800">{completingFacility.name}</p>
                    <p className="text-sm text-smoke-500 mt-0.5">
                      {completingFacility.district} · {completingFacility.address}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-smoke-400" />
                      <span className="text-xs text-smoke-500">
                        清理前：<span
                          className="px-2 py-0.5 rounded text-white text-xs font-medium"
                          style={{ backgroundColor: healthLevelColors[completingFacility.healthLevel] }}
                        >
                          {facilityStatusLabels[completingFacility.status]} ({completingFacility.currentLevel}%)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-smoke-700 mb-2 block flex items-center gap-1">
                  <Gauge className="w-4 h-4" />
                  清理后设施状态
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusSelect(opt.value)}
                      className={cn(
                        'py-2.5 px-2 rounded-lg text-xs font-medium transition-all border-2',
                        facilityStatusAfter === opt.value
                          ? 'border-brand-accent bg-brand-accent/5 text-brand-accent'
                          : 'border-transparent bg-smoke-100 text-smoke-600 hover:bg-smoke-200'
                      )}
                    >
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full inline-block mr-1.5',
                          facilityStatusColors[opt.value]
                        )}
                      />
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="text-smoke-500">剩余容量</span>
                    <span className="font-medium text-smoke-700">{currentLevelAfter}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentLevelAfter}
                    onChange={(e) => setCurrentLevelAfter(Number(e.target.value))}
                    className="w-full h-2 bg-smoke-200 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                  />
                  <div className="flex justify-between text-[10px] text-smoke-400 mt-0.5">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-smoke-700 mb-2 block flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  清理备注
                </label>
                <textarea
                  value={cleanerRemark}
                  onChange={(e) => setCleanerRemark(e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="请输入清理情况说明，例如：已完全清空、补充了烟蒂袋、发现部件损坏已报修等..."
                  className="w-full p-3 border border-smoke-200 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
                />
                <p className="text-xs text-smoke-400 mt-1 text-right">
                  {cleanerRemark.length}/200
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setShowCompleteModal(null)}
                className="flex-1 py-2.5 bg-smoke-100 text-smoke-700 rounded-lg font-medium hover:bg-smoke-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmComplete}
                className="flex-1 py-2.5 bg-health-good text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                确认完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
