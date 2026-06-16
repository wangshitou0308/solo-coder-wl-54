
import { useState } from 'react';
import { ClipboardList, Clock, MapPin, Filter, Search, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { workOrderTypeLabels, workOrderStatusLabels, workOrderPriorityLabels, workOrderPriorityColors, formatDateTime } from '../utils';
import type { WorkOrderStatus, WorkOrder } from '../types';
import { cn } from '../lib/utils';

const statusTabs: { value: WorkOrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' },
];

export default function WorkOrders() {
  const { workOrders, currentRole } = useAppStore();
  const [activeTab, setActiveTab] = useState<WorkOrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  const filteredOrders = workOrders.filter((order) => {
    if (activeTab !== 'all' && order.status !== activeTab) return false;
    if (searchTerm && !order.orderNo.includes(searchTerm) && !order.facilityName.includes(searchTerm)) return false;
    return true;
  });

  const getStatusColor = (status: WorkOrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'assigned': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-orange-100 text-orange-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-smoke-100 text-smoke-600';
      default: return 'bg-smoke-100 text-smoke-600';
    }
  };

  const getTimelineSteps = (order: WorkOrder) => {
    const steps = [
      { label: '提交上报', time: order.createTime, done: true },
      { label: '工单派单', time: order.assignTime, done: !!order.assignTime },
      { label: '现场处理', time: order.processTime, done: !!order.processTime },
      { label: '处理完成', time: order.completeTime, done: !!order.completeTime },
    ];
    return steps;
  };

  return (
    <div className="min-h-full bg-smoke-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-smoke-800 mb-1">工单管理</h1>
            <p className="text-smoke-500">
              {currentRole === 'citizen' ? '查看您上报的问题处理进度' : '管理和处理设施工单'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-smoke-400" />
              <input
                type="text"
                placeholder="搜索工单..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-smoke-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent bg-white"
              />
            </div>
            <button className="p-2 bg-white border border-smoke-200 rounded-lg hover:bg-smoke-50 transition-colors">
              <Filter className="w-5 h-5 text-smoke-500" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card mb-6 overflow-hidden">
          <div className="flex border-b border-smoke-100">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'flex-1 py-3 text-sm font-medium transition-colors relative',
                  activeTab === tab.value
                    ? 'text-brand-accent'
                    : 'text-smoke-500 hover:text-smoke-700'
                )}
              >
                {tab.label}
                <span className="ml-1.5 text-xs">
                  ({tab.value === 'all' ? workOrders.length : workOrders.filter(w => w.status === tab.value).length})
                </span>
                {activeTab === tab.value && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-brand-accent rounded-full" />
                )}
              </button>
            ))}
          </div>
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
                onClick={() => setSelectedOrder(order)}
                className="bg-white rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-smoke-800">{order.facilityName}</h3>
                      <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getStatusColor(order.status))}>
                        {workOrderStatusLabels[order.status]}
                      </span>
                    </div>
                    <p className="text-sm text-smoke-400 mt-1 font-mono">{order.orderNo}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-smoke-300" />
                </div>

                <div className="flex items-center gap-4 text-sm text-smoke-500 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {order.district}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDateTime(order.createTime)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-smoke-100 text-smoke-600 text-xs rounded">
                      {workOrderTypeLabels[order.type]}
                    </span>
                    <span
                      className="px-2 py-1 text-xs rounded text-white font-medium"
                      style={{ backgroundColor: workOrderPriorityColors[order.priority] }}
                    >
                      {workOrderPriorityLabels[order.priority]}优先级
                    </span>
                  </div>
                  {order.cleanerName && (
                    <span className="text-xs text-smoke-400">
                      处理人：{order.cleanerName}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedOrder && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedOrder(null)}
          >
            <div 
              className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto animate-bounce-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-smoke-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-smoke-800">{selectedOrder.facilityName}</h2>
                    <p className="text-sm text-smoke-400 font-mono mt-1">{selectedOrder.orderNo}</p>
                  </div>
                  <span className={cn('px-3 py-1 rounded-full text-sm font-medium', getStatusColor(selectedOrder.status))}>
                    {workOrderStatusLabels[selectedOrder.status]}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-medium text-smoke-800 mb-4">处理进度</h3>
                <div className="relative">
                  {getTimelineSteps(selectedOrder).map((step, index) => (
                    <div key={index} className="flex gap-4 pb-6 last:pb-0">
                      <div className="relative flex flex-col items-center">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium z-10',
                            step.done ? 'bg-brand-accent' : 'bg-smoke-200 text-smoke-400'
                          )}
                        >
                          {index + 1}
                        </div>
                        {index < 3 && (
                          <div
                            className={cn(
                              'w-0.5 h-full absolute top-8',
                              step.done && getTimelineSteps(selectedOrder)[index + 1]?.done
                                ? 'bg-brand-accent'
                                : 'bg-smoke-200'
                            )}
                          />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={cn('font-medium', step.done ? 'text-smoke-800' : 'text-smoke-400')}>
                          {step.label}
                        </p>
                        <p className="text-sm text-smoke-400 mt-0.5">
                          {step.time || '待处理'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-smoke-100">
                  <h3 className="font-medium text-smoke-800 mb-3">问题描述</h3>
                  <p className="text-smoke-600 text-sm leading-relaxed">
                    {selectedOrder.description}
                  </p>
                </div>

                {selectedOrder.images && selectedOrder.images.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-smoke-100">
                    <h3 className="font-medium text-smoke-800 mb-3">现场照片</h3>
                    <div className="flex gap-2 flex-wrap">
                      {selectedOrder.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-20 h-20 rounded-lg object-cover" />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-smoke-100">
                  <h3 className="font-medium text-smoke-800 mb-3">上报信息</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-smoke-400">上报人</p>
                      <p className="text-smoke-700">{selectedOrder.reporterName}</p>
                    </div>
                    <div>
                      <p className="text-smoke-400">联系电话</p>
                      <p className="text-smoke-700">{selectedOrder.reporterPhone}</p>
                    </div>
                    <div>
                      <p className="text-smoke-400">问题类型</p>
                      <p className="text-smoke-700">{workOrderTypeLabels[selectedOrder.type]}</p>
                    </div>
                    <div>
                      <p className="text-smoke-400">优先级</p>
                      <p className="text-smoke-700">{workOrderPriorityLabels[selectedOrder.priority]}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full py-2.5 bg-smoke-100 text-smoke-700 rounded-lg font-medium hover:bg-smoke-200 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
