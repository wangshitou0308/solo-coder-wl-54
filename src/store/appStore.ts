
import { create } from 'zustand';
import type {
  UserRole,
  User,
  Facility,
  FilterOptions,
  WorkOrder,
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderType,
  FacilityStatus,
  MaintenanceRecord,
  ProcessRecord,
  FilterSortBy,
  FacilityWithDistance,
  MaintenanceRecordType,
} from '../types';
import { facilities as mockFacilities } from '../data/facilities';
import { workOrders as mockWorkOrders } from '../data/workorders';
import {
  calculateDistance,
  getHealthLevelFromStatus,
  getStatusFromCurrentLevel,
  getEstimatedResponseMinutes,
  getEstimatedResponseTime,
  generateId,
} from '../utils';

interface AppState {
  currentRole: UserRole;
  currentUser: User | null;
  selectedFacility: Facility | null;
  selectedWorkOrderId: string | null;
  highlightedWorkOrderId: string | null;
  highlightedFacilityId: string | null;
  filterOptions: FilterOptions;
  workOrderFilter: {
    orderNo: string;
    facilityName: string;
    districts: string[];
    types: WorkOrderType[];
    statuses: WorkOrderStatus[];
  };
  userLocation: { lat: number; lng: number } | null;
  facilities: Facility[];
  workOrders: WorkOrder[];
  maintenanceRecords: MaintenanceRecord[];
  showFilterPanel: boolean;
  showDetailPanel: boolean;
  mapSearchKeyword: string;
  showMapSearch: boolean;

  setRole: (role: UserRole) => void;
  setSelectedFacility: (facility: Facility | null) => void;
  setSelectedWorkOrderId: (id: string | null) => void;
  setHighlightedWorkOrderId: (id: string | null) => void;
  setHighlightedFacilityId: (id: string | null) => void;
  setFilterOptions: (options: Partial<FilterOptions>) => void;
  setWorkOrderFilter: (options: Partial<AppState['workOrderFilter']>) => void;
  toggleFilterPanel: () => void;
  setShowDetailPanel: (show: boolean) => void;
  setMapSearchKeyword: (keyword: string) => void;
  setShowMapSearch: (show: boolean) => void;
  setUserLocation: (loc: { lat: number; lng: number } | null) => void;

  addWorkOrder: (order: WorkOrder) => void;
  updateWorkOrderStatus: (id: string, status: WorkOrderStatus, remark?: string) => void;
  acceptWorkOrder: (id: string) => void;
  completeWorkOrder: (
    id: string,
    data?: {
      cleanerRemark?: string;
      facilityStatusAfter?: FacilityStatus;
      currentLevelAfter?: number;
    }
  ) => void;
  addProcessRecord: (workOrderId: string, record: Omit<ProcessRecord, 'id' | 'workOrderId' | 'createTime'>) => void;

  getFilteredFacilities: () => FacilityWithDistance[];
  searchFacilities: (keyword: string) => FacilityWithDistance[];
  getNearbyFacilities: (facilityId: string, limit?: number) => FacilityWithDistance[];
  getFilteredWorkOrders: () => WorkOrder[];
  getWorkOrderById: (id: string) => WorkOrder | undefined;
  getFacilityById: (id: string) => Facility | undefined;
  getFacilityWorkOrders: (facilityId: string) => WorkOrder[];
  getFacilityMaintenanceRecords: (facilityId: string) => MaintenanceRecord[];

  updateFacility: (id: string, updates: Partial<Facility>) => void;
  updateFacilityStatus: (
    id: string,
    status: FacilityStatus,
    currentLevel?: number,
    remark?: string
  ) => void;
  addFacility: (facility: Omit<Facility, 'id' | 'createTime' | 'updateTime'>) => Facility;
  deactivateFacility: (id: string) => void;
  activateFacility: (id: string) => void;
  deleteFacility: (id: string) => void;
  batchUpdateFacilities: (ids: string[], updates: Partial<Facility>) => void;

  addMaintenanceRecord: (
    record: Omit<MaintenanceRecord, 'id' | 'createTime'>
  ) => MaintenanceRecord;
}

const users: Record<UserRole, User> = {
  citizen: {
    id: 'user-001',
    name: '市民用户',
    role: 'citizen',
    avatar: '',
  },
  cleaner: {
    id: 'cleaner-001',
    name: '张保洁',
    role: 'cleaner',
    phone: '13800138000',
    district: '朝阳区',
  },
  admin: {
    id: 'admin-001',
    name: '管理员',
    role: 'admin',
    phone: '13900139000',
  },
};

const defaultCenter = { lat: 39.9, lng: 116.4 };

function createNowString(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 16);
}

function getStatusPriority(status: FacilityStatus): number {
  switch (status) {
    case 'full': return 0;
    case 'nearly_full': return 1;
    case 'half': return 2;
    case 'empty': return 3;
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  currentRole: 'citizen',
  currentUser: users.citizen,
  selectedFacility: null,
  selectedWorkOrderId: null,
  highlightedWorkOrderId: null,
  highlightedFacilityId: null,
  filterOptions: {
    district: [],
    type: [],
    status: [],
    sortBy: 'distance',
  },
  workOrderFilter: {
    orderNo: '',
    facilityName: '',
    districts: [],
    types: [],
    statuses: [],
  },
  userLocation: defaultCenter,
  facilities: mockFacilities.map((f) => ({
    ...f,
    isActive: true,
    createTime: createNowString(),
    updateTime: createNowString(),
    maintenanceRecords: [],
  })),
  workOrders: mockWorkOrders.map((o) => ({
    ...o,
    estimatedResponseMinutes: getEstimatedResponseMinutes(o.priority),
    estimatedResponseTime: getEstimatedResponseTime(o.priority),
    processRecords: o.assignTime
      ? [
          {
            id: generateId('pr'),
            workOrderId: o.id,
            action: '工单创建',
            operatorName: o.reporterName,
            operatorRole: 'citizen',
            createTime: o.createTime,
            afterStatus: 'pending',
          },
          ...(o.assignTime
            ? [
                {
                  id: generateId('pr'),
                  workOrderId: o.id,
                  action: '工单派单',
                  operatorName: '系统',
                  operatorRole: 'system' as const,
                  createTime: o.assignTime,
                  beforeStatus: 'pending',
                  afterStatus: 'assigned',
                },
              ]
            : []),
          ...(o.processTime
            ? [
                {
                  id: generateId('pr'),
                  workOrderId: o.id,
                  action: '开始处理',
                  operatorName: o.cleanerName || '保洁员',
                  operatorRole: 'cleaner' as const,
                  createTime: o.processTime,
                  beforeStatus: 'assigned',
                  afterStatus: 'processing',
                },
              ]
            : []),
          ...(o.completeTime
            ? [
                {
                  id: generateId('pr'),
                  workOrderId: o.id,
                  action: '处理完成',
                  operatorName: o.cleanerName || '保洁员',
                  operatorRole: 'cleaner' as const,
                  createTime: o.completeTime,
                  beforeStatus: 'processing',
                  afterStatus: 'completed',
                  remark: o.remark,
                },
              ]
            : []),
        ]
      : [],
  })),
  maintenanceRecords: [],
  showFilterPanel: true,
  showDetailPanel: false,
  mapSearchKeyword: '',
  showMapSearch: true,

  setRole: (role: UserRole) => {
    set({
      currentRole: role,
      currentUser: users[role],
    });
  },

  setSelectedFacility: (facility: Facility | null) => {
    set({
      selectedFacility: facility,
      showDetailPanel: facility !== null,
    });
  },

  setSelectedWorkOrderId: (id: string | null) => {
    set({ selectedWorkOrderId: id });
  },

  setHighlightedWorkOrderId: (id: string | null) => {
    set({ highlightedWorkOrderId: id });
    if (id) {
      const order = get().workOrders.find((o) => o.id === id);
      if (order) {
        set({ highlightedFacilityId: order.facilityId });
      }
    }
  },

  setHighlightedFacilityId: (id: string | null) => {
    set({ highlightedFacilityId: id });
  },

  setFilterOptions: (options: Partial<FilterOptions>) => {
    set((state) => ({
      filterOptions: { ...state.filterOptions, ...options },
    }));
  },

  setWorkOrderFilter: (options: Partial<AppState['workOrderFilter']>) => {
    set((state) => ({
      workOrderFilter: { ...state.workOrderFilter, ...options },
    }));
  },

  toggleFilterPanel: () => {
    set((state) => ({ showFilterPanel: !state.showFilterPanel }));
  },

  setShowDetailPanel: (show: boolean) => {
    set({ showDetailPanel: show });
  },

  setMapSearchKeyword: (keyword: string) => {
    set({ mapSearchKeyword: keyword });
  },

  setShowMapSearch: (show: boolean) => {
    set({ showMapSearch: show });
  },

  setUserLocation: (loc) => {
    set({ userLocation: loc });
  },

  addWorkOrder: (order: WorkOrder) => {
    const priority: WorkOrderPriority = order.priority;
    const processRecords: ProcessRecord[] = [
      {
        id: generateId('pr'),
        workOrderId: order.id,
        action: '工单创建',
        operatorName: order.reporterName,
        operatorRole: 'citizen',
        createTime: order.createTime,
        afterStatus: 'pending',
      },
    ];
    set((state) => ({
      workOrders: [
        {
          ...order,
          estimatedResponseMinutes: getEstimatedResponseMinutes(priority),
          estimatedResponseTime: getEstimatedResponseTime(priority),
          processRecords,
        },
        ...state.workOrders,
      ],
    }));
  },

  updateWorkOrderStatus: (id: string, status: WorkOrderStatus, remark?: string) => {
    const { addProcessRecord } = get();
    set((state) => ({
      workOrders: state.workOrders.map((order) => {
        if (order.id !== id) return order;
        const now = createNowString();
        const updated: WorkOrder = { ...order, status };
        if (status === 'assigned' && !updated.assignTime) updated.assignTime = now;
        if (status === 'processing' && !updated.processTime) updated.processTime = now;
        if (status === 'completed') {
          updated.completeTime = now;
          if (remark) updated.remark = remark;
        }
        return updated;
      }),
    }));
    const order = get().workOrders.find((o) => o.id === id);
    if (order) {
      const role = get().currentUser?.role;
      const opRole: 'system' | 'cleaner' | 'admin' | 'citizen' =
        role === 'citizen' ? 'citizen' :
        role === 'cleaner' ? 'cleaner' :
        role === 'admin' ? 'admin' : 'system';
      addProcessRecord(id, {
        action: `状态更新为${status}`,
        operatorName: get().currentUser?.name || '系统',
        operatorRole: opRole,
        remark,
        afterStatus: status,
      });
    }
  },

  acceptWorkOrder: (id: string) => {
    const { currentUser, addProcessRecord } = get();
    const now = createNowString();
    set((state) => ({
      workOrders: state.workOrders.map((order) =>
        order.id === id
          ? {
              ...order,
              status: 'processing',
              cleanerId: currentUser?.id,
              cleanerName: currentUser?.name,
              assignTime: now,
              processTime: now,
            }
          : order
      ),
    }));
    addProcessRecord(id, {
      action: '保洁员接单开始处理',
      operatorName: currentUser?.name || '保洁员',
      operatorRole: 'cleaner',
      beforeStatus: 'assigned',
      afterStatus: 'processing',
    });
  },

  completeWorkOrder: (id: string, data?) => {
    const { currentUser, updateFacilityStatus, addMaintenanceRecord, addProcessRecord, getFacilityById, getWorkOrderById } = get();
    const now = createNowString();

    const order = getWorkOrderById(id);
    const facility = order ? getFacilityById(order.facilityId) : undefined;

    set((state) => ({
      workOrders: state.workOrders.map((o) =>
        o.id === id
          ? {
              ...o,
              status: 'completed',
              completeTime: now,
              remark: data?.cleanerRemark || o.remark || '已完成清理，设施状态恢复正常',
              cleanerRemark: data?.cleanerRemark,
              facilityStatusAfter: data?.facilityStatusAfter || 'empty',
              currentLevelAfter: data?.currentLevelAfter ?? 0,
            }
          : o
      ),
    }));

    if (facility) {
      const newStatus = data?.facilityStatusAfter || 'empty';
      const newLevel = data?.currentLevelAfter ?? 0;
      updateFacilityStatus(facility.id, newStatus, newLevel, data?.cleanerRemark);

      addMaintenanceRecord({
        facilityId: facility.id,
        type: 'clean',
        title: '工单完成清理',
        description: data?.cleanerRemark || '已完成设施清理',
        operatorName: currentUser?.name || '保洁员',
        operatorRole: 'cleaner',
        workOrderId: id,
        beforeStatus: facility.status,
        afterStatus: newStatus,
        currentLevelBefore: facility.currentLevel,
        currentLevelAfter: newLevel,
      });
    }

    addProcessRecord(id, {
      action: '处理完成',
      operatorName: currentUser?.name || '保洁员',
      operatorRole: 'cleaner',
      beforeStatus: 'processing',
      afterStatus: 'completed',
      remark: data?.cleanerRemark,
    });
  },

  addProcessRecord: (workOrderId, record) => {
    const now = createNowString();
    set((state) => ({
      workOrders: state.workOrders.map((o) =>
        o.id === workOrderId
          ? {
              ...o,
              processRecords: [
                ...(o.processRecords || []),
                {
                  ...record,
                  id: generateId('pr'),
                  workOrderId,
                  createTime: now,
                },
              ],
            }
          : o
      ),
    }));
  },

  getFilteredFacilities: () => {
    const { facilities, filterOptions, userLocation } = get();
    let result: FacilityWithDistance[] = facilities.filter((f) => f.isActive !== false);

    if (filterOptions.district.length > 0) {
      result = result.filter((f) => filterOptions.district.includes(f.district));
    }
    if (filterOptions.type.length > 0) {
      result = result.filter((f) => filterOptions.type.includes(f.type));
    }
    if (filterOptions.status.length > 0) {
      result = result.filter((f) => filterOptions.status.includes(f.status));
    }

    result = result.map((f) => ({
      ...f,
      distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, f.lat, f.lng) : undefined,
    }));

    const sortBy: FilterSortBy = filterOptions.sortBy;
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return getStatusPriority(a.status) - getStatusPriority(b.status);
        case 'distance':
        default:
          const da = a.distance ?? Number.MAX_SAFE_INTEGER;
          const db = b.distance ?? Number.MAX_SAFE_INTEGER;
          return da - db;
      }
    });

    return result;
  },

  searchFacilities: (keyword) => {
    const { facilities, userLocation } = get();
    const kw = keyword.trim().toLowerCase();
    if (!kw) return [];
    return facilities
      .filter((f) => f.isActive !== false)
      .filter(
        (f) =>
          f.name.toLowerCase().includes(kw) ||
          f.code.toLowerCase().includes(kw) ||
          f.address.toLowerCase().includes(kw)
      )
      .map((f) => ({
        ...f,
        distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, f.lat, f.lng) : undefined,
      }))
      .sort((a, b) => {
        const da = a.distance ?? Number.MAX_SAFE_INTEGER;
        const db = b.distance ?? Number.MAX_SAFE_INTEGER;
        return da - db;
      });
  },

  getNearbyFacilities: (facilityId, limit = 5) => {
    const { facilities, getFacilityById } = get();
    const facility = getFacilityById(facilityId);
    if (!facility) return [];
    return facilities
      .filter((f) => f.id !== facilityId && f.isActive !== false)
      .map((f) => ({
        ...f,
        distance: calculateDistance(facility.lat, facility.lng, f.lat, f.lng),
      }))
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
      .slice(0, limit);
  },

  getFilteredWorkOrders: () => {
    const { workOrders, workOrderFilter, currentRole, currentUser } = get();
    let result = [...workOrders];

    if (currentRole === 'citizen') {
      result = result.filter((o) => o.reporterPhone === currentUser?.phone || true);
    } else if (currentRole === 'cleaner') {
      const pool = result.filter((o) => o.status === 'pending' || o.status === 'assigned');
      const mine = result.filter((o) => o.cleanerId === currentUser?.id);
      result = [...pool.filter((p) => !mine.find((m) => m.id === p.id)), ...mine];
    }

    if (workOrderFilter.orderNo) {
      result = result.filter((o) => o.orderNo.toLowerCase().includes(workOrderFilter.orderNo.toLowerCase()));
    }
    if (workOrderFilter.facilityName) {
      result = result.filter((o) => o.facilityName.toLowerCase().includes(workOrderFilter.facilityName.toLowerCase()));
    }
    if (workOrderFilter.districts.length > 0) {
      result = result.filter((o) => o.district && workOrderFilter.districts.includes(o.district));
    }
    if (workOrderFilter.types.length > 0) {
      result = result.filter((o) => workOrderFilter.types.includes(o.type));
    }
    if (workOrderFilter.statuses.length > 0) {
      result = result.filter((o) => workOrderFilter.statuses.includes(o.status));
    }

    return result;
  },

  getWorkOrderById: (id) => {
    return get().workOrders.find((o) => o.id === id);
  },

  getFacilityById: (id) => {
    return get().facilities.find((f) => f.id === id);
  },

  getFacilityWorkOrders: (facilityId) => {
    return get().workOrders.filter((o) => o.facilityId === facilityId);
  },

  getFacilityMaintenanceRecords: (facilityId) => {
    const records = get().maintenanceRecords.filter((r) => r.facilityId === facilityId);
    const workOrders = get().getFacilityWorkOrders(facilityId);
    const derivedRecords: MaintenanceRecord[] = workOrders
      .filter((o) => o.status === 'completed')
      .map(
        (o) =>
          ({
            id: `derived-${o.id}`,
            facilityId,
            type: 'clean' as MaintenanceRecordType,
            title: `工单清理：${o.orderNo}`,
            description: o.remark || '完成设施清理',
            operatorName: o.cleanerName || '保洁员',
            operatorRole: 'cleaner' as const,
            createTime: o.completeTime || o.createTime,
            workOrderId: o.id,
            beforeStatus: o.facilityStatusAfter ? undefined : 'full',
            afterStatus: o.facilityStatusAfter || 'empty',
            currentLevelAfter: o.currentLevelAfter,
          })
      );
    const exceptionRecords: MaintenanceRecord[] = workOrders.map(
      (o) =>
        ({
          id: `exc-${o.id}`,
          facilityId,
          type: 'exception' as MaintenanceRecordType,
          title: `异常上报：${o.orderNo}`,
          description: o.description,
          operatorName: o.reporterName,
          operatorRole: 'citizen' as const,
          createTime: o.createTime,
          workOrderId: o.id,
        })
    );

    return [...records, ...derivedRecords, ...exceptionRecords].sort(
      (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    );
  },

  updateFacility: (id, updates) => {
    const now = createNowString();
    set((state) => ({
      facilities: state.facilities.map((f) =>
        f.id === id
          ? {
              ...f,
              ...updates,
              updateTime: now,
              healthLevel:
                updates.status !== undefined
                  ? getHealthLevelFromStatus(updates.status)
                  : updates.currentLevel !== undefined
                  ? getHealthLevelFromStatus(getStatusFromCurrentLevel(updates.currentLevel))
                  : f.healthLevel,
              status:
                updates.currentLevel !== undefined
                  ? getStatusFromCurrentLevel(updates.currentLevel)
                  : updates.status || f.status,
            }
          : f
      ),
    }));
  },

  updateFacilityStatus: (id, status, currentLevel, remark) => {
    const now = createNowString();
    const level = currentLevel !== undefined ? currentLevel : (() => {
      switch (status) {
        case 'empty': return 10;
        case 'half': return 40;
        case 'nearly_full': return 65;
        case 'full': return 90;
      }
    })();
    set((state) => ({
      facilities: state.facilities.map((f) =>
        f.id === id
          ? {
              ...f,
              status,
              currentLevel: level,
              healthLevel: getHealthLevelFromStatus(status),
              lastCleanTime: status === 'empty' || status === 'half' ? now : f.lastCleanTime,
              updateTime: now,
            }
          : f
      ),
    }));
  },

  addFacility: (facilityData) => {
    const now = createNowString();
    const newId = generateId('fac', 3);
    const newFacility: Facility = {
      ...facilityData,
      id: newId,
      isActive: true,
      createTime: now,
      updateTime: now,
      healthLevel: getHealthLevelFromStatus(facilityData.status),
      maintenanceRecords: [],
    };
    set((state) => ({
      facilities: [...state.facilities, newFacility],
    }));
    return newFacility;
  },

  deactivateFacility: (id) => {
    get().updateFacility(id, { isActive: false });
  },

  activateFacility: (id) => {
    get().updateFacility(id, { isActive: true });
  },

  deleteFacility: (id) => {
    set((state) => ({
      facilities: state.facilities.filter((f) => f.id !== id),
    }));
  },

  batchUpdateFacilities: (ids, updates) => {
    ids.forEach((id) => get().updateFacility(id, updates));
  },

  addMaintenanceRecord: (recordData) => {
    const now = createNowString();
    const record: MaintenanceRecord = {
      ...recordData,
      id: generateId('mr'),
      createTime: now,
    };
    set((state) => ({
      maintenanceRecords: [record, ...state.maintenanceRecords],
    }));
    return record;
  },
}));
