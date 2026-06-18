
import { useState, useMemo } from 'react';
import {
  X,
  MapPin,
  Calendar,
  FileText,
  Wrench,
  ClipboardList,
  Plus,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Facility, MaintenanceRecord, MaintenanceRecordType, WorkOrder } from '../../types';
import {
  facilityTypeLabels,
  facilityStatusBgColors,
  facilityStatusLabels,
  healthLevelLabels,
  healthLevelColors,
  crowdDensityLabels,
  maintenanceTypeLabels,
  maintenanceTypeColors,
  workOrderTypeLabels,
  workOrderStatusColors,
  workOrderStatusLabels,
  formatFullDateTime,
} from '../../utils';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../lib/utils';

interface FacilityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: Facility | null;
}

type TabKey = 'overview' | 'maintenance' | 'workorders';

export default function FacilityDetailModal({ isOpen, onClose, facility }: FacilityDetailModalProps) {
  const navigate = useNavigate();
  const {
    currentUser,
    getFacilityMaintenanceRecords,
    getFacilityWorkOrders,
    addMaintenanceRecord,
    setHighlightedWorkOrderId,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [recordFilter, setRecordFilter] = useState<MaintenanceRecordType | 'all'>('all');
  const [recordForm, setRecordForm] = useState({
    type: 'inspection' as MaintenanceRecordType,
    title: '',
    description: '',
  });

  const maintenanceRecords = useMemo(() => {
    if (!facility) return [];
    const records = getFacilityMaintenanceRecords(facility.id);
    return recordFilter === 'all'
      ? records
      : records.filter((r) => r.type === recordFilter);
  }, [facility, recordFilter, getFacilityMaintenanceRecords]);

  const facilityWorkOrders = useMemo(() => {
    if (!facility) return [];
    return getFacilityWorkOrders(facility.id);
  }, [facility, getFacilityWorkOrders]);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facility || !currentUser) return;
    addMaintenanceRecord({
      facilityId: facility.id,
      type: recordForm.type,
      title: recordForm.title,
      description: recordForm.description,
      operatorName: currentUser.name,
      operatorRole: currentUser.role === 'citizen' ? 'citizen' : currentUser.role === 'cleaner' ? 'cleaner' : 'admin',
    });
    setRecordForm({ type: 'inspection', title: '', description: '' });
    setShowAddRecord(false);
  };

  const handleJumpToWorkOrder = (orderId: string) => {
    setHighlightedWorkOrderId(orderId);
    navigate('/workorders', { state: { highlightId: orderId } });
    onClose();
  };

  const getRecordIcon = (type: MaintenanceRecordType) => {
    switch (type) {
      case 'clean': return <CheckCircle2 className="w-4 h-4" />;
      case 'repair': return <Wrench className="w-4 h-4" />;
      case 'exception': return <AlertTriangle className="w-4 h-4" />;
      case 'inspection': return <Eye className="w-4 h-4" />;
    }
  };

  if (!isOpen || !facility) return null;

  const tabs = [
    { key: 'overview' as TabKey, label: '设施概览', icon: Info },
    { key: 'maintenance' as TabKey, label: `维护记录 (${getFacilityMaintenanceRecords(facility.id).length})`, icon: FileText },
    { key: 'workorders' as TabKey, label: `关联工单 (${facilityWorkOrders.length})`, icon: ClipboardList },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-fade-in flex flex-col">
        <div className={cn(
          'px-6 py-5 border-b',
          facility.healthLevel === 'danger'
            ? 'bg-gradient-to-r from-red-50 to-white border-red-100'
            : facility.healthLevel === 'warning' || facility.healthLevel === 'alert'
            ? 'bg-gradient-to-r from-yellow-50 to-white border-yellow-100'
            : 'bg-gradient-to-r from-green-50 to-white border-green-100'
        )}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg',
                facility.healthLevel === 'danger'
                  ? 'bg-gradient-to-br from-red-500 to-red-600'
                  : facility.healthLevel === 'warning' || facility.healthLevel === 'alert'
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-br from-green-500 to-emerald-600'
              )}>
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-smoke-800">{facility.name}</h2>
                  <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', facilityStatusBgColors[facility.status])}>
                    {facilityStatusLabels[facility.status]}
                  </span>
                  {facility.isActive === false && (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-smoke-100 text-smoke-600">
                      已停用
                    </span>
                  )}
                </div>
                <p className="text-sm text-smoke-500 mt-1 font-mono">编号：{facility.code}</p>
                <p className="text-sm text-smoke-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {facility.address}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/80 text-smoke-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-smoke-100 px-6 bg-white">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px',
                  activeTab === tab.key
                    ? 'text-brand-accent border-brand-accent'
                    : 'text-smoke-500 border-transparent hover:text-smoke-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto bg-smoke-50/30">
          {activeTab === 'overview' && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-smoke-100">
                  <h3 className="font-semibold text-smoke-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-brand-accent rounded-full" />
                    基本信息
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoRow label="设施类型" value={facilityTypeLabels[facility.type]} />
                    <InfoRow label="所属区域" value={facility.district} />
                    <InfoRow label="健康等级" value={
                      <span className="font-medium" style={{ color: healthLevelColors[facility.healthLevel] }}>
                        {healthLevelLabels[facility.healthLevel]}
                      </span>
                    } />
                    <InfoRow label="人群密度" value={crowdDensityLabels[facility.crowdDensity]} />
                    <InfoRow label="是否有烟灰缸" value={facility.hasAshtray ? '是' : '否'} />
                    <InfoRow label="是否有垃圾桶" value={facility.hasTrashBin ? '是' : '否'} />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-smoke-100">
                  <h3 className="font-semibold text-smoke-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-500 rounded-full" />
                    容量状态
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-smoke-500">当前容量占用</span>
                        <span className="font-semibold text-smoke-800">
                          {facility.currentLevel}% ({Math.round(facility.capacity * facility.currentLevel / 100)}/{facility.capacity}个)
                        </span>
                      </div>
                      <div className="h-3 bg-smoke-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            facility.currentLevel < 50 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                            facility.currentLevel < 80 ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                            : 'bg-gradient-to-r from-orange-500 to-red-500'
                          )}
                          style={{ width: `${facility.currentLevel}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <InfoRow label="上次清理" value={formatFullDateTime(facility.lastCleanTime)} mono />
                      <InfoRow label="维护日期" value={facility.maintenanceDate} />
                      <InfoRow label="创建时间" value={formatFullDateTime(facility.createTime || '-')} mono />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-smoke-100">
                  <h3 className="font-semibold text-smoke-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-purple-500 rounded-full" />
                    坐标信息
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoRow
                      label="纬度 (Lat)"
                      value={<span className="font-mono">{facility.lat.toFixed(6)}</span>}
                    />
                    <InfoRow
                      label="经度 (Lng)"
                      value={<span className="font-mono">{facility.lng.toFixed(6)}</span>}
                    />
                    <InfoRow label="更新时间" value={formatFullDateTime(facility.updateTime || '-')} mono />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg shadow-blue-500/20">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    维护统计
                  </h3>
                  <div className="space-y-3">
                    <StatChip label="维护记录" value={getFacilityMaintenanceRecords(facility.id).length} />
                    <StatChip label="关联工单" value={facilityWorkOrders.length} />
                    <StatChip
                      label="已完成工单"
                      value={facilityWorkOrders.filter((w) => w.status === 'completed').length}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-smoke-100">
                  <h3 className="font-semibold text-smoke-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-orange-500 rounded-full" />
                    最新维护
                  </h3>
                  <div className="space-y-3">
                    {maintenanceRecords.slice(0, 3).map((record) => (
                      <div
                        key={record.id}
                        className="flex items-start gap-3 p-3 bg-smoke-50 rounded-lg"
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                          maintenanceTypeColors[record.type]
                        )}>
                          {getRecordIcon(record.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-smoke-800 truncate">{record.title}</p>
                          <p className="text-xs text-smoke-500 mt-0.5">{formatFullDateTime(record.createTime)}</p>
                        </div>
                      </div>
                    ))}
                    {maintenanceRecords.length === 0 && (
                      <p className="text-sm text-smoke-400 text-center py-4">暂无维护记录</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setRecordFilter('all')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                      recordFilter === 'all'
                        ? 'bg-brand-accent text-white'
                        : 'bg-white text-smoke-600 hover:bg-smoke-100 border border-smoke-200'
                    )}
                  >
                    全部
                  </button>
                  {(Object.keys(maintenanceTypeLabels) as MaintenanceRecordType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setRecordFilter(type)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5',
                        recordFilter === type
                          ? 'bg-brand-accent text-white'
                          : 'bg-white text-smoke-600 hover:bg-smoke-100 border border-smoke-200'
                      )}
                    >
                      {getRecordIcon(type)}
                      {maintenanceTypeLabels[type]}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddRecord(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  新增记录
                </button>
              </div>

              {showAddRecord && (
                <div className="bg-white rounded-xl p-5 mb-5 shadow-sm border-2 border-brand-accent/30 animate-fade-in">
                  <h4 className="font-medium text-smoke-800 mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-brand-accent" />
                    新增维护记录
                  </h4>
                  <form onSubmit={handleAddRecord} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-smoke-700 mb-1.5">记录类型</label>
                      <select
                        value={recordForm.type}
                        onChange={(e) => setRecordForm({ ...recordForm, type: e.target.value as MaintenanceRecordType })}
                        className="w-full px-3 py-2 rounded-lg border border-smoke-200 focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none text-sm"
                      >
                        {(Object.keys(maintenanceTypeLabels) as MaintenanceRecordType[]).map((type) => (
                          <option key={type} value={type}>{maintenanceTypeLabels[type]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-smoke-700 mb-1.5">标题</label>
                      <input
                        type="text"
                        required
                        value={recordForm.title}
                        onChange={(e) => setRecordForm({ ...recordForm, title: e.target.value })}
                        placeholder="例如：日常巡检正常"
                        className="w-full px-3 py-2 rounded-lg border border-smoke-200 focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-smoke-700 mb-1.5">详细描述</label>
                      <textarea
                        rows={3}
                        value={recordForm.description}
                        onChange={(e) => setRecordForm({ ...recordForm, description: e.target.value })}
                        placeholder="请输入维护记录的详细内容..."
                        className="w-full px-3 py-2 rounded-lg border border-smoke-200 focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none text-sm resize-none"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddRecord(false)}
                        className="px-4 py-2 rounded-lg border border-smoke-200 text-smoke-700 text-sm font-medium hover:bg-smoke-50 transition-colors"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        确认添加
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-smoke-200" />
                <div className="space-y-1">
                  {maintenanceRecords.map((record, idx) => (
                    <MaintenanceTimelineItem
                      key={record.id}
                      record={record}
                      isLast={idx === maintenanceRecords.length - 1}
                      icon={getRecordIcon(record.type)}
                    />
                  ))}
                  {maintenanceRecords.length === 0 && (
                    <div className="bg-white rounded-xl p-10 text-center border border-smoke-100">
                      <FileText className="w-12 h-12 text-smoke-300 mx-auto mb-3" />
                      <p className="text-smoke-500">暂无维护记录</p>
                      <p className="text-xs text-smoke-400 mt-1">点击右上角按钮新增第一条维护记录</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workorders' && (
            <div className="p-6">
              <div className="space-y-3">
                {facilityWorkOrders.map((order) => (
                  <WorkOrderCard key={order.id} order={order} onJump={handleJumpToWorkOrder} />
                ))}
                {facilityWorkOrders.length === 0 && (
                  <div className="bg-white rounded-xl p-10 text-center border border-smoke-100">
                    <ClipboardList className="w-12 h-12 text-smoke-300 mx-auto mb-3" />
                    <p className="text-smoke-500">暂无关联工单</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-smoke-100 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-smoke-200 text-smoke-700 font-medium hover:bg-smoke-50 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-smoke-500 mb-1 flex items-center gap-1">
        <Calendar className="w-3 h-3 opacity-60" />
        {label}
      </p>
      <p className={cn('text-smoke-800', mono && 'font-mono text-xs')}>{value}</p>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 bg-white/10 rounded-xl backdrop-blur-sm">
      <span className="text-sm text-white/80">{label}</span>
      <span className="font-bold text-lg">{value}</span>
    </div>
  );
}

function MaintenanceTimelineItem({
  record,
  isLast,
  icon,
}: {
  record: MaintenanceRecord;
  isLast: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative pl-16 pb-5">
      <div className={cn(
        'absolute left-3 w-7 h-7 rounded-full flex items-center justify-center shadow-md ring-4 ring-white z-10',
        maintenanceTypeColors[record.type]
      )}>
        {icon}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-smoke-100 hover:shadow-md transition-all">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className={cn('px-2 py-0.5 text-xs font-medium rounded', maintenanceTypeColors[record.type])}>
              {maintenanceTypeLabels[record.type]}
            </span>
            {record.workOrderId && (
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-700 font-mono">
                工单关联
              </span>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-smoke-400">{formatFullDateTime(record.createTime)}</p>
            <p className="text-xs text-smoke-500 mt-0.5">操作人：{record.operatorName}</p>
          </div>
        </div>

        <h4 className="font-medium text-smoke-800 mb-2">{record.title}</h4>
        {record.description && (
          <p className="text-sm text-smoke-600 leading-relaxed">{record.description}</p>
        )}

        {(record.beforeStatus || record.afterStatus || record.currentLevelBefore !== undefined) && (
          <div className="mt-4 pt-4 border-t border-smoke-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {record.beforeStatus && (
              <div>
                <p className="text-xs text-smoke-400 mb-1">处理前状态</p>
                <span className={cn('px-2 py-0.5 text-xs font-medium rounded', facilityStatusBgColors[record.beforeStatus])}>
                  {facilityStatusLabels[record.beforeStatus]}
                </span>
              </div>
            )}
            {record.afterStatus && (
              <div>
                <p className="text-xs text-smoke-400 mb-1">处理后状态</p>
                <span className={cn('px-2 py-0.5 text-xs font-medium rounded', facilityStatusBgColors[record.afterStatus])}>
                  {facilityStatusLabels[record.afterStatus]}
                </span>
              </div>
            )}
            {record.currentLevelBefore !== undefined && (
              <div>
                <p className="text-xs text-smoke-400 mb-1">处理前容量</p>
                <p className="font-medium text-smoke-700">{record.currentLevelBefore}%</p>
              </div>
            )}
            {record.currentLevelAfter !== undefined && (
              <div>
                <p className="text-xs text-smoke-400 mb-1">处理后容量</p>
                <p className="font-medium text-green-600">{record.currentLevelAfter}%</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkOrderCard({ order, onJump }: { order: WorkOrder; onJump: (id: string) => void }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-smoke-100 hover:shadow-md hover:border-brand-accent/30 transition-all cursor-pointer" onClick={() => onJump(order.id)}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-medium text-smoke-800">{order.orderNo}</span>
              <span className={cn('px-2 py-0.5 text-xs font-medium rounded', workOrderStatusColors[order.status])}>
                {workOrderStatusLabels[order.status]}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-smoke-100 text-smoke-600">
                {workOrderTypeLabels[order.type]}
              </span>
            </div>
            <p className="text-sm text-smoke-600 mb-1.5">{order.description}</p>
            <div className="flex items-center gap-4 text-xs text-smoke-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatFullDateTime(order.createTime)}
              </span>
              {order.cleanerName && (
                <span>处理人：{order.cleanerName}</span>
              )}
              {order.completeTime && (
                <span className="text-green-600">完成于：{formatFullDateTime(order.completeTime)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-sm text-brand-accent font-medium flex items-center gap-1 flex-shrink-0">
          查看工单
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
