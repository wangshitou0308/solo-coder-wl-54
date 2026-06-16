
import { useState } from 'react';
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Navigation,
  AlertTriangle,
  ChevronRight,
  Play,
  Check,
  Filter
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { workOrderTypeLabels, workOrderStatusLabels, workOrderPriorityLabels, workOrderPriorityColors, formatDateTime } from '../utils';
import type { WorkOrderStatus } from '../types';
import { cn } from '../lib/utils';
import MapView from '../components/Map/MapView';

const statusTabs: { value: WorkOrderStatus | 'all'; label: string; icon: typeof Clock }[] = [
  { value: 'pending', label: '待接单', icon: Clock },
  { value: 'processing', label: '进行中', icon: Play },
  { value: 'completed', label: '已完成', icon: CheckCircle },
];

export default function CleanerView() {
  const { workOrders, currentUser, updateWorkOrderStatus } = useAppStore();
  const [activeTab, setActiveTab] = useState<WorkOrderStatus | 'all'>('pending');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const myOrders = workOrders.filter((order) => 
    order.cleanerId === currentUser?.id || order.status === 'pending' || order.status === 'assigned'
  );

  const filteredOrders = myOrders.filter((order) => {
    if (activeTab !== 'all' && order.status !== activeTab) return false;
    return true;
  });

  const handleAcceptOrder = (orderId: string) => {
    updateWorkOrderStatus(orderId, 'processing');
  };

  const handleCompleteOrder = (orderId: string) => {
    updateWorkOrderStatus(orderId, 'completed');
  };

  const getStatusColor = (status: WorkOrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'assigned': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-orange-100 text-orange-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-smoke-100 text-smoke-600';
    }
  };

  const pendingCount = myOrders.filter(o => o.status === 'pending' || o.status === 'assigned').length;
  const processingCount = myOrders.filter(o => o.status === 'processing').length;
  const completedCount = myOrders.filter(o => o.status === 'completed').length;

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
              const count = tab.value === 'all' 
                ? myOrders.length 
                : myOrders.filter(o => o.status === tab.value).length;
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
                  <span className={cn(
                    'px-1.5 py-0.5 text-xs rounded-full',
                    activeTab === tab.value ? 'bg-white/20' : 'bg-smoke-100'
                  )}>
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
              filteredOrders.map((order) => (
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
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-smoke-800">{order.facilityName}</h3>
                          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getStatusColor(order.status))}>
                            {workOrderStatusLabels[order.status]}
                          </span>
                          <span
                            className="px-2 py-0.5 text-xs rounded text-white font-medium"
                            style={{ backgroundColor: workOrderPriorityColors[order.priority] }}
                          >
                            {workOrderPriorityLabels[order.priority]}
                          </span>
                        </div>
                        <p className="text-sm text-smoke-500 font-mono mb-2">{order.orderNo}</p>
                        <div className="flex items-center gap-4 text-sm text-smoke-500">
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
                        </div>
                      </div>
                      <ChevronRight className={cn(
                        'w-5 h-5 text-smoke-300 transition-transform',
                        selectedOrder === order.id && 'rotate-90'
                      )} />
                    </div>
                  </div>

                  {selectedOrder === order.id && (
                    <div className="px-5 pb-5 border-t border-smoke-100 pt-4 animate-fade-in">
                      <p className="text-sm text-smoke-600 mb-4">{order.description}</p>
                      
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
                            <button className="py-2.5 px-4 bg-smoke-100 text-smoke-600 rounded-lg font-medium hover:bg-smoke-200 transition-colors flex items-center gap-2">
                              <Navigation className="w-4 h-4" />
                              导航
                            </button>
                          </>
                        )}
                        {order.status === 'processing' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteOrder(order.id);
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
                            已完成
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-180px)]">
          <MapView showFilters={false} />
        </div>
      )}
    </div>
  );
}
