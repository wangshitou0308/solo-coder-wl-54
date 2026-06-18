
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  MapPin,
  Filter,
  Search,
  ChevronRight,
  X,
  Trash2,
  Building2,
  AlertTriangle,
  FileText,
  User,
  Phone,
  Tag,
  Hash,
  Activity,
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
  facilityTypeLabels,
  facilityStatusLabels,
  healthLevelColors,
} from '../utils';
import type { WorkOrderStatus, WorkOrder, WorkOrderType } from '../types';
import { cn } from '../lib/utils';
import { getDistricts } from '../data/facilities';

const statusTabs: { value: WorkOrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' },
];

const typeOptions: WorkOrderType[] = ['overflow', 'damage', 'missing_bag', 'other'];

export default function WorkOrders() {
  const location = useLocation();
  const locState = location.state as { highlightId?: string } | null;
  const {
    getFilteredWorkOrders,
    getFacilityById,
    workOrderFilter,
    setWorkOrderFilter,
    highlightedWorkOrderId,
    setHighlightedWorkOrderId,
    currentRole,
  } = useAppStore();

  const workOrders = getFilteredWorkOrders();
  const districts = getDistricts();

  const [activeTab, setActiveTab] = useState<WorkOrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetId = locState?.highlightId || highlightedWorkOrderId;
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(`wo-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      const timer = setTimeout(() => {
        setHighlightedWorkOrderId(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [locState, highlightedWorkOrderId, setHighlightedWorkOrderId]);

  const filteredOrders = workOrders.filter((order) => {
    if (activeTab !== 'all' && order.status !== activeTab) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (
        !order.orderNo.toLowerCase().includes(term) &&
        !order.facilityName.toLowerCase().includes(term)
      )
        return false;
    }
    return true;
  });

  const toggleDistrict = (d: string) => {
    setWorkOrderFilter({
      districts: workOrderFilter.districts.includes(d)
        ? workOrderFilter.districts.filter((x) => x !== d)
        : [...workOrderFilter.districts, d],
    });
  };

  const toggleType = (t: WorkOrderType) => {
    setWorkOrderFilter({
      types: workOrderFilter.types.includes(t)
        ? workOrderFilter.types.filter((x) => x !== t)
        : [...workOrderFilter.types, t],
    });
  };

  const toggleStatus = (s: WorkOrderStatus) => {
    setWorkOrderFilter({
      statuses: workOrderFilter.statuses.includes(s)
        ? workOrderFilter.statuses.filter((x) => x !== s)
        : [...workOrderFilter.statuses, s],
    });
  };

  const clearFilters = () => {
    setWorkOrderFilter({
      orderNo: '',
      facilityName: '',
      districts: [],
      types: [],
      statuses: [],
    });
    setSearchTerm('');
    setActiveTab('all');
  };

  const activeFilterCount =
    workOrderFilter.districts.length +
    workOrderFilter.types.length +
    workOrderFilter.statuses.length;

  const isHighlighted = (id: string) =>
    highlightedWorkOrderId === id || locState?.highlightId === id;

  return (
    <div className="min-h-full bg-smoke-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-smoke-800 mb-1">工单管理</h1>
            <p className="text-smoke-500">
              {currentRole === 'citizen'
                ? '查看您上报的问题处理进度'
                : '管理和处理设施工单'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-smoke-400" />
              <input
                type="text"
                placeholder="搜索编号、设施..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-smoke-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent bg-white"
              />
            </div>
            <button
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              className={cn(
                'p-2 bg-white border border-smoke-200 rounded-lg hover:bg-smoke-50 transition-colors relative',
                activeFilterCount > 0 && 'ring-2 ring-brand-accent/30'
              )}
            >
              <Filter className="w-5 h-5 text-smoke-500" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-health-danger text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {showAdvancedFilter && (
          <div className="bg-white rounded-xl shadow-card mb-6 p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-smoke-800 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                高级筛选
              </h3>
              <button
                onClick={clearFilters}
                className="text-xs text-brand-accent hover:underline"
              >
                清空筛选
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-smoke-500 mb-2 block">
                  工单编号
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-smoke-400" />
                  <input
                    type="text"
                    value={workOrderFilter.orderNo}
                    onChange={(e) => setWorkOrderFilter({ orderNo: e.target.value })}
                    placeholder="输入工单编号..."
                    className="w-full pl-9 pr-4 py-2 bg-smoke-50 border border-smoke-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-smoke-500 mb-2 block">
                  设施名称
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-smoke-400" />
                  <input
                    type="text"
                    value={workOrderFilter.facilityName}
                    onChange={(e) => setWorkOrderFilter({ facilityName: e.target.value })}
                    placeholder="输入设施名称..."
                    className="w-full pl-9 pr-4 py-2 bg-smoke-50 border border-smoke-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-smoke-500 mb-2 block">
                  所在区域
                </label>
                <div className="flex flex-wrap gap-2">
                  {districts.map((d) => (
                    <button
                      key={d}
                      onClick={() => toggleDistrict(d)}
                      className={cn(
                        'px-3 py-1.5 text-xs rounded-full transition-all',
                        workOrderFilter.districts.includes(d)
                          ? 'bg-brand-accent text-white'
                          : 'bg-smoke-100 text-smoke-600 hover:bg-smoke-200'
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-smoke-500 mb-2 block">
                  问题类型
                </label>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleType(t)}
                      className={cn(
                        'px-3 py-1.5 text-xs rounded-full transition-all',
                        workOrderFilter.types.includes(t)
                          ? 'bg-health-danger text-white'
                          : 'bg-smoke-100 text-smoke-600 hover:bg-smoke-200'
                      )}
                    >
                      {workOrderTypeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-smoke-500 mb-2 block">
                  处理状态
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'assigned', 'processing', 'completed'] as WorkOrderStatus[]).map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => toggleStatus(s)}
                        className={cn(
                          'px-3 py-1.5 text-xs rounded-full transition-all',
                          workOrderFilter.statuses.includes(s)
                            ? 'bg-health-good text-white'
                            : 'bg-smoke-100 text-smoke-600 hover:bg-smoke-200'
                        )}
                      >
                        {workOrderStatusLabels[s]}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
                  ({tab.value === 'all'
                    ? workOrders.length
                    : workOrders.filter((w) => w.status === tab.value).length})
                </span>
                {activeTab === tab.value && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-brand-accent rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div ref={scrollRef} className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl">
              <ClipboardList className="w-12 h-12 text-smoke-300 mx-auto mb-4" />
              <p className="text-smoke-500">暂无工单</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                id={`wo-${order.id}`}
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={cn(
                  'bg-white rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all cursor-pointer',
                  isHighlighted(order.id) &&
                    'ring-2 ring-brand-accent shadow-lg shadow-brand-accent/20 animate-pulse-ring-bg'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-smoke-800">{order.facilityName}</h3>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          workOrderStatusColors[order.status]
                        )}
                      >
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
                  {order.estimatedResponseTime && order.status === 'pending' && (
                    <span className="flex items-center gap-1 text-health-warning">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {order.estimatedResponseTime}
                    </span>
                  )}
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
                    <span className="text-xs text-smoke-400">处理人：{order.cleanerName}</span>
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
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-bounce-in flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-smoke-100 flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-smoke-800">
                        {selectedOrder.facilityName}
                      </h2>
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium',
                          workOrderStatusColors[selectedOrder.status]
                        )}
                      >
                        {workOrderStatusLabels[selectedOrder.status]}
                      </span>
                    </div>
                    <p className="text-sm text-smoke-400 font-mono">{selectedOrder.orderNo}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1.5 rounded-full hover:bg-smoke-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-smoke-500" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-brand-accent/5 rounded-xl p-5 border border-brand-accent/10">
                  <h3 className="font-medium text-smoke-800 mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-accent" />
                    设施信息
                  </h3>
                  {(() => {
                    const facility = getFacilityById(selectedOrder.facilityId);
                    if (!facility) {
                      return <p className="text-sm text-smoke-400">设施信息暂不可用</p>;
                    }
                    return (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-smoke-400 mb-0.5">设施编号</p>
                          <p className="font-mono text-smoke-700">{facility.code}</p>
                        </div>
                        <div>
                          <p className="text-xs text-smoke-400 mb-0.5">设施类型</p>
                          <p className="text-smoke-700">{facilityTypeLabels[facility.type]}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-smoke-400 mb-0.5">详细地址</p>
                          <p className="text-smoke-700 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-smoke-400" />
                            {facility.district} · {facility.address}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-smoke-400 mb-0.5">容量状态</p>
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: healthLevelColors[facility.healthLevel] }}
                          >
                            {facilityStatusLabels[facility.status]} ({facility.currentLevel}%)
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-smoke-400 mb-0.5">上次清理</p>
                          <p className="text-smoke-700">{formatDateTime(facility.lastCleanTime)}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <h3 className="font-medium text-smoke-800 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-health-good" />
                    处理进度
                  </h3>
                  <div className="relative">
                    {(selectedOrder.processRecords || []).map((rec, index, arr) => (
                      <div key={rec.id} className="flex gap-4 pb-5 last:pb-0">
                        <div className="relative flex flex-col items-center">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium z-10',
                              'bg-brand-accent'
                            )}
                          >
                            {index + 1}
                          </div>
                          {index < arr.length - 1 && (
                            <div className="w-0.5 h-full absolute top-8 bg-brand-accent/30" />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-medium text-smoke-800">{rec.action}</p>
                          <p className="text-xs text-smoke-400 mt-0.5">
                            {rec.operatorName} · {formatFullDateTime(rec.createTime)}
                          </p>
                          {rec.remark && (
                            <p className="text-sm text-smoke-600 mt-1.5 p-2 bg-smoke-50 rounded">
                              {rec.remark}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {(selectedOrder.processRecords || []).length === 0 && (
                      <p className="text-sm text-smoke-400">暂无处理记录</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-smoke-100">
                  <h3 className="font-medium text-smoke-800 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-smoke-400" />
                    问题描述
                  </h3>
                  <p className="text-smoke-600 text-sm leading-relaxed">
                    {selectedOrder.description}
                  </p>
                </div>

                {selectedOrder.images && selectedOrder.images.length > 0 && (
                  <div className="pt-2 border-t border-smoke-100">
                    <h3 className="font-medium text-smoke-800 mb-3">现场照片</h3>
                    <div className="flex gap-2 flex-wrap">
                      {selectedOrder.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt=""
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-smoke-100">
                  <h3 className="font-medium text-smoke-800 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-smoke-400" />
                    工单详情
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-smoke-400 mb-0.5 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        上报人
                      </p>
                      <p className="text-smoke-700">{selectedOrder.reporterName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-smoke-400 mb-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        联系电话
                      </p>
                      <p className="text-smoke-700">{selectedOrder.reporterPhone || '未填写'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-smoke-400 mb-0.5 flex items-center gap-1">
                        <Trash2 className="w-3 h-3" />
                        问题类型
                      </p>
                      <p className="text-smoke-700">{workOrderTypeLabels[selectedOrder.type]}</p>
                    </div>
                    <div>
                      <p className="text-xs text-smoke-400 mb-0.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        优先级
                      </p>
                      <span
                        className="px-2 py-0.5 text-xs rounded text-white font-medium"
                        style={{ backgroundColor: workOrderPriorityColors[selectedOrder.priority] }}
                      >
                        {workOrderPriorityLabels[selectedOrder.priority]}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedOrder.status === 'completed' && selectedOrder.cleanerRemark && (
                  <div className="pt-2 border-t border-smoke-100">
                    <h3 className="font-medium text-smoke-800 mb-3">处理备注</h3>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-sm text-green-800">{selectedOrder.cleanerRemark}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 pt-4 border-t border-smoke-100 flex-shrink-0">
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
