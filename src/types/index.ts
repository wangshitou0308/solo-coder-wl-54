
export type FacilityType = 'indoor_room' | 'outdoor_pavilion' | 'standalone_pillar';

export type FacilityStatus = 'empty' | 'half' | 'nearly_full' | 'full';

export type HealthLevel = 'good' | 'warning' | 'alert' | 'danger';

export type CrowdDensity = 'low' | 'medium' | 'high' | 'very_high';

export interface Facility {
  id: string;
  code: string;
  name: string;
  type: FacilityType;
  status: FacilityStatus;
  healthLevel: HealthLevel;
  lat: number;
  lng: number;
  address: string;
  district: string;
  capacity: number;
  currentLevel: number;
  lastCleanTime: string;
  crowdDensity: CrowdDensity;
  hasAshtray: boolean;
  hasTrashBin: boolean;
  maintenanceDate: string;
}

export type WorkOrderType = 'overflow' | 'damage' | 'missing_bag' | 'other';

export type WorkOrderStatus = 'pending' | 'assigned' | 'processing' | 'completed' | 'cancelled';

export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface WorkOrder {
  id: string;
  orderNo: string;
  facilityId: string;
  facilityName: string;
  type: WorkOrderType;
  description: string;
  images: string[];
  reporterName: string;
  reporterPhone: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  createTime: string;
  assignTime?: string;
  processTime?: string;
  completeTime?: string;
  cleanerId?: string;
  cleanerName?: string;
  remark?: string;
  district?: string;
}

export type UserRole = 'citizen' | 'cleaner' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  district?: string;
}

export interface DashboardStats {
  totalFacilities: number;
  overflowRate: number;
  avgResponseTime: number;
  todayReports: number;
  totalWorkOrders: number;
  completedOrders: number;
  pendingOrders: number;
  districtDistribution: { name: string; value: number }[];
  overflowTrend: { date: string; rate: number }[];
  responseTimeTrend: { date: string; time: number }[];
  heatmapData: { lat: number; lng: number; value: number }[];
  facilityTypeDistribution: { name: string; value: number }[];
  statusDistribution: { name: string; value: number; color: string }[];
  workOrderTypeDistribution: { name: string; value: number }[];
  hourlyTrend: { hour: string; count: number }[];
}

export interface FilterOptions {
  district: string[];
  type: FacilityType[];
  status: FacilityStatus[];
  sortBy: 'distance' | 'name' | 'status';
}
