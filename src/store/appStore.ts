
import { create } from 'zustand';
import type { UserRole, User, Facility, FilterOptions, WorkOrder } from '../types';
import { facilities as mockFacilities } from '../data/facilities';
import { workOrders as mockWorkOrders } from '../data/workorders';

interface AppState {
  currentRole: UserRole;
  currentUser: User | null;
  selectedFacility: Facility | null;
  filterOptions: FilterOptions;
  facilities: Facility[];
  workOrders: WorkOrder[];
  showFilterPanel: boolean;
  showDetailPanel: boolean;
  
  setRole: (role: UserRole) => void;
  setSelectedFacility: (facility: Facility | null) => void;
  setFilterOptions: (options: Partial<FilterOptions>) => void;
  toggleFilterPanel: () => void;
  setShowDetailPanel: (show: boolean) => void;
  addWorkOrder: (order: WorkOrder) => void;
  updateWorkOrderStatus: (id: string, status: WorkOrder['status']) => void;
  getFilteredFacilities: () => Facility[];
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

export const useAppStore = create<AppState>((set, get) => ({
  currentRole: 'citizen',
  currentUser: users.citizen,
  selectedFacility: null,
  filterOptions: {
    district: [],
    type: [],
    status: [],
    sortBy: 'distance',
  },
  facilities: mockFacilities,
  workOrders: mockWorkOrders,
  showFilterPanel: true,
  showDetailPanel: false,

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

  setFilterOptions: (options: Partial<FilterOptions>) => {
    set((state) => ({
      filterOptions: { ...state.filterOptions, ...options },
    }));
  },

  toggleFilterPanel: () => {
    set((state) => ({ showFilterPanel: !state.showFilterPanel }));
  },

  setShowDetailPanel: (show: boolean) => {
    set({ showDetailPanel: show });
  },

  addWorkOrder: (order: WorkOrder) => {
    set((state) => ({
      workOrders: [order, ...state.workOrders],
    }));
  },

  updateWorkOrderStatus: (id: string, status: WorkOrder['status']) => {
    set((state) => ({
      workOrders: state.workOrders.map((order) =>
        order.id === id ? { ...order, status } : order
      ),
    }));
  },

  getFilteredFacilities: () => {
    const { facilities, filterOptions } = get();
    let filtered = [...facilities];

    if (filterOptions.district.length > 0) {
      filtered = filtered.filter((f) => filterOptions.district.includes(f.district));
    }

    if (filterOptions.type.length > 0) {
      filtered = filtered.filter((f) => filterOptions.type.includes(f.type));
    }

    if (filterOptions.status.length > 0) {
      filtered = filtered.filter((f) => filterOptions.status.includes(f.status));
    }

    return filtered;
  },
}));
