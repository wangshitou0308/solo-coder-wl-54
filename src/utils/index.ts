
import type { FacilityType, FacilityStatus, HealthLevel, CrowdDensity, WorkOrderType, WorkOrderStatus, WorkOrderPriority, MaintenanceRecordType } from '../types';

export const facilityTypeLabels: Record<FacilityType, string> = {
  indoor_room: '室内吸烟室',
  outdoor_pavilion: '室外吸烟亭',
  standalone_pillar: '独立烟蒂柱',
};

export const facilityStatusLabels: Record<FacilityStatus, string> = {
  empty: '空',
  half: '半满',
  nearly_full: '将满',
  full: '已满',
};

export const facilityStatusColors: Record<FacilityStatus, string> = {
  empty: 'bg-health-good',
  half: 'bg-health-warning',
  nearly_full: 'bg-health-alert',
  full: 'bg-health-danger',
};

export const facilityStatusBgColors: Record<FacilityStatus, string> = {
  empty: 'bg-green-100 text-green-700',
  half: 'bg-yellow-100 text-yellow-700',
  nearly_full: 'bg-orange-100 text-orange-700',
  full: 'bg-red-100 text-red-700',
};

export const maintenanceTypeLabels: Record<MaintenanceRecordType, string> = {
  clean: '清理记录',
  repair: '维修记录',
  exception: '异常上报',
  inspection: '日常巡检',
};

export const maintenanceTypeColors: Record<MaintenanceRecordType, string> = {
  clean: 'bg-green-100 text-green-700',
  repair: 'bg-blue-100 text-blue-700',
  exception: 'bg-red-100 text-red-700',
  inspection: 'bg-purple-100 text-purple-700',
};

export const healthLevelLabels: Record<HealthLevel, string> = {
  good: '良好',
  warning: '注意',
  alert: '警告',
  danger: '危险',
};

export const healthLevelColors: Record<HealthLevel, string> = {
  good: '#27AE60',
  warning: '#F1C40F',
  alert: '#E67E22',
  danger: '#E74C3C',
};

export const crowdDensityLabels: Record<CrowdDensity, string> = {
  low: '低',
  medium: '中',
  high: '高',
  very_high: '极高',
};

export const workOrderTypeLabels: Record<WorkOrderType, string> = {
  overflow: '烟蒂满溢',
  damage: '设施损坏',
  missing_bag: '缺少烟蒂袋',
  other: '其他问题',
};

export const workOrderStatusLabels: Record<WorkOrderStatus, string> = {
  pending: '待处理',
  assigned: '已派单',
  processing: '处理中',
  completed: '已完成',
  cancelled: '已取消',
};

export const workOrderStatusColors: Record<WorkOrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-blue-100 text-blue-700',
  processing: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-smoke-100 text-smoke-600',
};

export const workOrderPriorityLabels: Record<WorkOrderPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

export const workOrderPriorityColors: Record<WorkOrderPriority, string> = {
  low: '#27AE60',
  medium: '#3498DB',
  high: '#E67E22',
  urgent: '#E74C3C',
};

export const workOrderPriorityBgColors: Record<WorkOrderPriority, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}米`;
  }
  return `${km.toFixed(2)}公里`;
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return dateStr.substring(0, 10);
}

export function formatFullDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  return dateStr.replace('T', ' ').substring(0, 16);
}

export function getFacilityIconName(type: FacilityType): string {
  switch (type) {
    case 'indoor_room':
      return 'Building2';
    case 'outdoor_pavilion':
      return 'Umbrella';
    case 'standalone_pillar':
      return 'Trash2';
    default:
      return 'MapPin';
  }
}

export function getStatusFromHealthLevel(level: HealthLevel): FacilityStatus {
  switch (level) {
    case 'good':
      return 'half';
    case 'warning':
      return 'nearly_full';
    case 'alert':
    case 'danger':
      return 'full';
    default:
      return 'empty';
  }
}

export function getHealthLevelFromStatus(status: FacilityStatus): HealthLevel {
  switch (status) {
    case 'empty':
    case 'half':
      return 'good';
    case 'nearly_full':
      return 'warning';
    case 'full':
      return 'danger';
  }
}

export function getStatusFromCurrentLevel(level: number): FacilityStatus {
  if (level < 25) return 'empty';
  if (level < 50) return 'half';
  if (level < 80) return 'nearly_full';
  return 'full';
}

export function getEstimatedResponseMinutes(priority: WorkOrderPriority): number {
  switch (priority) {
    case 'urgent': return 30;
    case 'high': return 60;
    case 'medium': return 120;
    case 'low': return 240;
  }
}

export function getEstimatedResponseTime(priority: WorkOrderPriority): string {
  const minutes = getEstimatedResponseMinutes(priority);
  if (minutes < 60) return `预计${minutes}分钟内响应`;
  return `预计${Math.floor(minutes / 60)}小时内响应`;
}

export function generateId(prefix: string, length: number = 3): string {
  return `${prefix}-${String(Date.now()).slice(-length)}${String(Math.floor(Math.random() * 1000)).padStart(length, '0')}`;
}

export function copyToClipboard(text: string): Promise<boolean> {
  try {
    navigator.clipboard.writeText(text);
    return Promise.resolve(true);
  } catch {
    return Promise.resolve(false);
  }
}
