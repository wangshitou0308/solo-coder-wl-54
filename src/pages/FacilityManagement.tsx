
import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Power,
  Play,
  Eye,
  Filter,
  ChevronDown,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
  Settings2,
  FileSpreadsheet,
} from 'lucide-react';
import type { Facility, FacilityType, FacilityStatus, FilterSortBy } from '../types';
import {
  facilityTypeLabels,
  facilityStatusLabels,
  facilityStatusBgColors,
  healthLevelLabels,
  healthLevelColors,
  formatFullDateTime,
} from '../utils';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';
import FacilityFormModal from '../components/Facility/FacilityFormModal';
import FacilityDetailModal from '../components/Facility/FacilityDetailModal';

interface FilterState {
  keyword: string;
  districts: string[];
  types: FacilityType[];
  statuses: FacilityStatus[];
  includeInactive: boolean;
  sortBy: FilterSortBy;
}

const ALL_DISTRICTS = ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区'];

export default function FacilityManagement() {
  const {
    facilities,
    userLocation,
    deactivateFacility,
    activateFacility,
    deleteFacility,
    batchUpdateFacilities,
  } = useAppStore();

  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    districts: [],
    types: [],
    statuses: [],
    includeInactive: false,
    sortBy: 'status',
  });
  const [showFilterPanel, setShowFilterPanel] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [viewingFacility, setViewingFacility] = useState<Facility | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [batchAction, setBatchAction] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ type: string; ids: string[]; title: string; message: string } | null>(null);

  const filteredFacilities = useMemo(() => {
    let result = [...facilities];

    if (!filters.includeInactive) {
      result = result.filter((f) => f.isActive !== false);
    }

    if (filters.keyword) {
      const kw = filters.keyword.trim().toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(kw) ||
          f.code.toLowerCase().includes(kw) ||
          f.address.toLowerCase().includes(kw)
      );
    }
    if (filters.districts.length > 0) {
      result = result.filter((f) => filters.districts.includes(f.district));
    }
    if (filters.types.length > 0) {
      result = result.filter((f) => filters.types.includes(f.type));
    }
    if (filters.statuses.length > 0) {
      result = result.filter((f) => filters.statuses.includes(f.status));
    }

    const getStatusPriority = (status: FacilityStatus): number => {
      switch (status) {
        case 'full': return 0;
        case 'nearly_full': return 1;
        case 'half': return 2;
        case 'empty': return 3;
      }
    };

    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return getStatusPriority(a.status) - getStatusPriority(b.status);
        case 'distance':
        default:
          if (!userLocation) return 0;
          const da = Math.hypot(a.lat - userLocation.lat, a.lng - userLocation.lng);
          const db = Math.hypot(b.lat - userLocation.lat, b.lng - userLocation.lng);
          return da - db;
      }
    });

    return result;
  }, [facilities, filters, userLocation]);

  const stats = useMemo(() => ({
    total: facilities.length,
    active: facilities.filter((f) => f.isActive !== false).length,
    inactive: facilities.filter((f) => f.isActive === false).length,
    full: facilities.filter((f) => f.status === 'full' && f.isActive !== false).length,
    alert: facilities.filter((f) => (f.healthLevel === 'danger' || f.healthLevel === 'alert') && f.isActive !== false).length,
  }), [facilities]);

  const allSelected = filteredFacilities.length > 0 && filteredFacilities.every((f) => selectedIds.has(f.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      const newSet = new Set(selectedIds);
      filteredFacilities.forEach((f) => newSet.delete(f.id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      filteredFacilities.forEach((f) => newSet.add(f.id));
      setSelectedIds(newSet);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBatchAction = (action: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    switch (action) {
      case 'activate':
        setConfirmDialog({
          type: 'activate',
          ids,
          title: `批量启用 ${ids.length} 个设施`,
          message: `确认启用选中的 ${ids.length} 个设施？启用后将在地图上正常显示。`,
        });
        break;
      case 'deactivate':
        setConfirmDialog({
          type: 'deactivate',
          ids,
          title: `批量停用 ${ids.length} 个设施`,
          message: `确认停用选中的 ${ids.length} 个设施？停用后将在地图上隐藏。`,
        });
        break;
      case 'delete':
        setConfirmDialog({
          type: 'delete',
          ids,
          title: `批量删除 ${ids.length} 个设施`,
          message: `警告：此操作不可恢复！确认删除选中的 ${ids.length} 个设施？`,
        });
        break;
    }
    setBatchAction(null);
  };

  const executeConfirm = () => {
    if (!confirmDialog) return;
    const { type, ids } = confirmDialog;

    switch (type) {
      case 'activate':
        ids.forEach((id) => activateFacility(id));
        break;
      case 'deactivate':
        ids.forEach((id) => deactivateFacility(id));
        break;
      case 'delete':
        ids.forEach((id) => deleteFacility(id));
        break;
      case 'single-delete':
        ids.forEach((id) => deleteFacility(id));
        break;
      case 'single-deactivate':
        ids.forEach((id) => deactivateFacility(id));
        break;
      case 'single-activate':
        ids.forEach((id) => activateFacility(id));
        break;
    }

    setSelectedIds(new Set());
    setConfirmDialog(null);
  };

  const handleSingleAction = (action: string, facility: Facility) => {
    switch (action) {
      case 'edit':
        setEditingFacility(facility);
        setShowFormModal(true);
        break;
      case 'view':
        setViewingFacility(facility);
        setShowDetailModal(true);
        break;
      case 'delete':
        setConfirmDialog({
          type: 'single-delete',
          ids: [facility.id],
          title: '删除设施',
          message: `警告：此操作不可恢复！确认删除设施"${facility.name}"？`,
        });
        break;
      case 'deactivate':
        setConfirmDialog({
          type: 'single-deactivate',
          ids: [facility.id],
          title: '停用设施',
          message: `确认停用设施"${facility.name}"？停用后将在地图上隐藏。`,
        });
        break;
      case 'activate':
        setConfirmDialog({
          type: 'single-activate',
          ids: [facility.id],
          title: '启用设施',
          message: `确认启用设施"${facility.name}"？`,
        });
        break;
    }
  };

  const resetFilters = () => {
    setFilters({
      keyword: '',
      districts: [],
      types: [],
      statuses: [],
      includeInactive: false,
      sortBy: 'status',
    });
  };

  return (
    <div className="min-h-full bg-smoke-50">
      <div className="px-6 pt-6 pb-4 border-b border-smoke-200 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-smoke-800 mb-1 flex items-center gap-2">
              <Settings2 className="w-6 h-6 text-brand-accent" />
              设施管理
            </h1>
            <p className="text-sm text-smoke-500">全生命周期设施管理：新增、编辑、停用、维护记录追踪</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-smoke-200 bg-white text-smoke-700 text-sm font-medium hover:bg-smoke-50 transition-colors">
              <FileSpreadsheet className="w-4 h-4" />
              导出数据
            </button>
            <button
              onClick={() => {
                setEditingFacility(null);
                setShowFormModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              新建设施
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <StatCard2 title="设施总数" value={stats.total} icon={MapPin} color="blue" />
          <StatCard2 title="启用中" value={stats.active} icon={CheckCircle2} color="green" />
          <StatCard2 title="已停用" value={stats.inactive} icon={Power} color="gray" />
          <StatCard2 title="已满设施" value={stats.full} icon={AlertTriangle} color="orange" />
          <StatCard2 title="告警设施" value={stats.alert} icon={AlertTriangle} color="red" />
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-smoke-100 mb-4 overflow-hidden">
          <div className="px-5 py-4 border-b border-smoke-100 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-smoke-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filters.keyword}
                  onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                  placeholder="搜索设施名称、编号、地址..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-smoke-50 border border-smoke-200 focus:bg-white focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                  showFilterPanel
                    ? 'bg-brand-accent text-white shadow-md shadow-blue-500/20'
                    : 'bg-smoke-50 text-smoke-700 border border-smoke-200 hover:bg-smoke-100'
                )}
              >
                <Filter className="w-4 h-4" />
                高级筛选
                <ChevronDown className={cn('w-4 h-4 transition-transform', showFilterPanel && 'rotate-180')} />
              </button>
              {(filters.keyword || filters.districts.length + filters.types.length + filters.statuses.length > 0 || filters.includeInactive) && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm text-brand-accent hover:bg-blue-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  重置筛选
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as FilterSortBy })}
                className="px-3 py-2 rounded-lg border border-smoke-200 bg-white text-sm focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none"
              >
                <option value="status">按状态优先级排序</option>
                <option value="name">按名称排序</option>
                <option value="distance">按距离排序</option>
              </select>

              {selectedIds.size > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setBatchAction(batchAction ? null : 'menu')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20"
                  >
                    批量操作
                    <span className="px-1.5 py-0.5 rounded bg-white/20 text-xs font-bold">
                      {selectedIds.size}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {batchAction === 'menu' && (
                    <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-xl border border-smoke-100 py-1 z-20 animate-fade-in">
                      <button
                        onClick={() => handleBatchAction('activate')}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-smoke-700 hover:bg-smoke-50"
                      >
                        <Play className="w-4 h-4 text-green-500" />
                        批量启用
                      </button>
                      <button
                        onClick={() => handleBatchAction('deactivate')}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-smoke-700 hover:bg-smoke-50"
                      >
                        <Power className="w-4 h-4 text-yellow-500" />
                        批量停用
                      </button>
                      <div className="h-px bg-smoke-100 my-1" />
                      <button
                        onClick={() => handleBatchAction('delete')}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        批量删除
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {showFilterPanel && (
            <div className="px-5 py-4 bg-smoke-50/50 border-b border-smoke-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
              <FilterGroup
                label="所属区域"
                options={ALL_DISTRICTS}
                selected={filters.districts}
                onChange={(v) => setFilters({ ...filters, districts: v as string[] })}
              />
              <FilterGroup
                label="设施类型"
                options={Object.entries(facilityTypeLabels).map(([k, v]) => ({ key: k, label: v }))}
                selected={filters.types}
                onChange={(v) => setFilters({ ...filters, types: v as FacilityType[] })}
              />
              <FilterGroup
                label="容量状态"
                options={Object.entries(facilityStatusLabels).map(([k, v]) => ({ key: k, label: v }))}
                selected={filters.statuses}
                onChange={(v) => setFilters({ ...filters, statuses: v as FacilityStatus[] })}
              />
              <div className="flex flex-col">
                <label className="text-xs font-medium text-smoke-600 mb-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  其他选项
                </label>
                <label className="flex items-center gap-2.5 p-3 bg-white rounded-lg border border-smoke-200 cursor-pointer hover:border-brand-accent/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.includeInactive}
                    onChange={(e) => setFilters({ ...filters, includeInactive: e.target.checked })}
                    className="w-4 h-4 accent-brand-accent"
                  />
                  <span className="text-sm text-smoke-700">包含已停用设施</span>
                </label>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-smoke-50 text-xs text-smoke-500 uppercase tracking-wider border-b border-smoke-100">
                  <th className="px-5 py-3.5 text-left w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-brand-accent"
                    />
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold">设施信息</th>
                  <th className="px-5 py-3.5 text-left font-semibold">类型/区域</th>
                  <th className="px-5 py-3.5 text-left font-semibold">状态/容量</th>
                  <th className="px-5 py-3.5 text-left font-semibold">健康度</th>
                  <th className="px-5 py-3.5 text-left font-semibold">上次清理</th>
                  <th className="px-5 py-3.5 text-left font-semibold">维护</th>
                  <th className="px-5 py-3.5 text-right font-semibold">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-smoke-100">
                {filteredFacilities.map((facility) => (
                  <tr
                    key={facility.id}
                    className={cn(
                      'group hover:bg-blue-50/30 transition-colors',
                      selectedIds.has(facility.id) && 'bg-brand-accent/5',
                      facility.isActive === false && 'opacity-60'
                    )}
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(facility.id)}
                        onChange={() => toggleSelect(facility.id)}
                        className="w-4 h-4 accent-brand-accent"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm',
                          facility.healthLevel === 'danger'
                            ? 'bg-red-100'
                            : facility.healthLevel === 'warning' || facility.healthLevel === 'alert'
                            ? 'bg-yellow-100'
                            : 'bg-green-100'
                        )}>
                          <MapPin className={cn(
                            'w-5 h-5',
                            facility.healthLevel === 'danger'
                              ? 'text-red-600'
                              : facility.healthLevel === 'warning' || facility.healthLevel === 'alert'
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          )} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-smoke-800 truncate">{facility.name}</p>
                          <p className="text-xs text-smoke-500 font-mono mt-0.5">{facility.code}</p>
                          <p className="text-xs text-smoke-400 mt-0.5 truncate max-w-xs" title={facility.address}>
                            {facility.address}
                          </p>
                          {facility.isActive === false && (
                            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 text-xs font-medium rounded bg-smoke-100 text-smoke-600">
                              <Power className="w-3 h-3" />
                              已停用
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm">
                        <p className="text-smoke-700">{facilityTypeLabels[facility.type]}</p>
                        <p className="text-xs text-smoke-500 mt-0.5">{facility.district}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        <span className={cn('inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full', facilityStatusBgColors[facility.status])}>
                          {facilityStatusLabels[facility.status]}
                        </span>
                        <div className="w-24">
                          <div className="flex justify-between text-xs text-smoke-400 mb-1">
                            <span>容量</span>
                            <span className="font-medium text-smoke-600">{facility.currentLevel}%</span>
                          </div>
                          <div className="h-1.5 bg-smoke-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                facility.currentLevel < 50 ? 'bg-green-500' :
                                facility.currentLevel < 80 ? 'bg-yellow-500' : 'bg-red-500'
                              )}
                              style={{ width: `${facility.currentLevel}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${healthLevelColors[facility.healthLevel]}15`,
                          color: healthLevelColors[facility.healthLevel],
                        }}
                      >
                        {facility.healthLevel === 'good' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {healthLevelLabels[facility.healthLevel]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm">
                        <p className="text-smoke-700 font-mono text-xs">{formatFullDateTime(facility.lastCleanTime)}</p>
                        <p className="text-xs text-smoke-400 mt-0.5">维护：{facility.maintenanceDate}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-700">
                          {useAppStore.getState().getFacilityMaintenanceRecords(facility.id).length} 条记录
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <ActionButton
                          icon={<Eye className="w-3.5 h-3.5" />}
                          label="查看"
                          onClick={() => handleSingleAction('view', facility)}
                        />
                        <ActionButton
                          icon={<Edit3 className="w-3.5 h-3.5" />}
                          label="编辑"
                          onClick={() => handleSingleAction('edit', facility)}
                        />
                        {facility.isActive === false ? (
                          <ActionButton
                            icon={<Play className="w-3.5 h-3.5" />}
                            label="启用"
                            variant="green"
                            onClick={() => handleSingleAction('activate', facility)}
                          />
                        ) : (
                          <ActionButton
                            icon={<Power className="w-3.5 h-3.5" />}
                            label="停用"
                            variant="yellow"
                            onClick={() => handleSingleAction('deactivate', facility)}
                          />
                        )}
                        <ActionButton
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          label="删除"
                          variant="red"
                          onClick={() => handleSingleAction('delete', facility)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredFacilities.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <MapPin className="w-12 h-12 text-smoke-200" />
                        <p className="text-smoke-500">未找到匹配的设施</p>
                        <p className="text-xs text-smoke-400">尝试调整筛选条件或搜索关键词</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-smoke-100 flex items-center justify-between text-sm text-smoke-500 bg-smoke-50/30">
            <span>
              共 <span className="font-semibold text-smoke-800">{filteredFacilities.length}</span> 条结果
              {selectedIds.size > 0 && (
                <span className="ml-2">
                  ，已选 <span className="font-semibold text-brand-accent">{selectedIds.size}</span> 条
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      <FacilityFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingFacility(null);
        }}
        editingFacility={editingFacility}
      />

      <FacilityDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setViewingFacility(null);
        }}
        facility={viewingFacility}
      />

      {confirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in mx-4">
            <div className={cn(
              'px-6 py-5',
              confirmDialog.type.includes('delete')
                ? 'bg-gradient-to-r from-red-50 to-white'
                : 'bg-gradient-to-r from-yellow-50 to-white'
            )}>
              <h3 className="text-lg font-bold text-smoke-800 flex items-center gap-2">
                {confirmDialog.type.includes('delete') ? (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                ) : (
                  <Info className="w-5 h-5 text-yellow-500" />
                )}
                {confirmDialog.title}
              </h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-smoke-600 leading-relaxed">{confirmDialog.message}</p>
            </div>
            <div className="px-6 py-4 bg-smoke-50 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-5 py-2.5 rounded-lg border border-smoke-200 bg-white text-smoke-700 text-sm font-medium hover:bg-smoke-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={executeConfirm}
                className={cn(
                  'px-5 py-2.5 rounded-lg text-white text-sm font-medium shadow-md transition-all',
                  confirmDialog.type.includes('delete')
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                    : 'bg-brand-accent hover:bg-blue-600 shadow-blue-500/20'
                )}
              >
                确认操作
              </button>
            </div>
          </div>
        </div>
      )}

      {batchAction === 'menu' && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setBatchAction(null)}
        />
      )}
    </div>
  );
}

function StatCard2({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'gray' | 'orange' | 'red';
}) {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500', shadow: 'shadow-blue-500/10' },
    green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500', shadow: 'shadow-green-500/10' },
    gray: { bg: 'bg-smoke-100', text: 'text-smoke-600', icon: 'text-smoke-500', shadow: 'shadow-smoke-500/10' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500', shadow: 'shadow-orange-500/10' },
    red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500', shadow: 'shadow-red-500/10' },
  };
  const c = colors[color];

  return (
    <div className={cn('rounded-xl p-4 bg-white border border-smoke-100 shadow-sm hover:shadow-md transition-shadow')}>
      <div className="flex items-center gap-3">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', c.bg)}>
          <Icon className={cn('w-5 h-5', c.icon)} />
        </div>
        <div>
          <p className="text-xs text-smoke-500">{title}</p>
          <p className={cn('text-xl font-bold mt-0.5', c.text)}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: (string | { key: string; label: string })[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const getKey = (opt: string | { key: string; label: string }) =>
    typeof opt === 'string' ? opt : opt.key;
  const getLabel = (opt: string | { key: string; label: string }) =>
    typeof opt === 'string' ? opt : opt.label;

  return (
    <div className="flex flex-col">
      <label className="text-xs font-medium text-smoke-600 mb-2">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const key = getKey(opt);
          const label = getLabel(opt);
          const isActive = selected.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border',
                isActive
                  ? 'bg-brand-accent text-white border-brand-accent shadow-sm shadow-blue-500/20'
                  : 'bg-white text-smoke-600 border-smoke-200 hover:border-brand-accent/40 hover:text-brand-accent'
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'green' | 'yellow' | 'red';
}) {
  const variants = {
    default: 'text-smoke-500 hover:bg-smoke-100 hover:text-smoke-700',
    green: 'text-green-500 hover:bg-green-50 hover:text-green-600',
    yellow: 'text-yellow-500 hover:bg-yellow-50 hover:text-yellow-600',
    red: 'text-red-500 hover:bg-red-50 hover:text-red-600',
  };
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all',
        variants[variant]
      )}
      title={label}
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}
