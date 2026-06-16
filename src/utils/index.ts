
import type { FacilityType, FacilityStatus, HealthLevel, CrowdDensity, WorkOrderType, WorkOrderStatus, WorkOrderPriority } from '../types';

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
