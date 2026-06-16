
import type { DashboardStats } from '../types';

const districts = ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区'];

export const dashboardStats: DashboardStats = {
  totalFacilities: 50,
  overflowRate: 15.2,
  avgResponseTime: 45,
  todayReports: 12,
  totalWorkOrders: 35,
  completedOrders: 21,
  pendingOrders: 8,
  districtDistribution: districts.map(d => ({
    name: d,
    value: Math.floor(Math.random() * 15) + 5,
  })),
  overflowTrend: Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      rate: Number((10 + Math.random() * 15).toFixed(1)),
    };
  }),
  responseTimeTrend: Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      time: Math.floor(30 + Math.random() * 40),
    };
  }),
  heatmapData: Array.from({ length: 100 }, () => ({
    lat: 39.8 + Math.random() * 0.18,
    lng: 116.25 + Math.random() * 0.3,
    value: Math.floor(Math.random() * 100),
  })),
  facilityTypeDistribution: [
    { name: '室内吸烟室', value: 15 },
    { name: '室外吸烟亭', value: 20 },
    { name: '独立烟蒂柱', value: 15 },
  ],
  statusDistribution: [
    { name: '空', value: 18, color: '#27AE60' },
    { name: '半满', value: 15, color: '#F1C40F' },
    { name: '将满', value: 10, color: '#E67E22' },
    { name: '已满', value: 7, color: '#E74C3C' },
  ],
  workOrderTypeDistribution: [
    { name: '烟蒂满溢', value: 15 },
    { name: '设施损坏', value: 8 },
    { name: '缺少烟蒂袋', value: 7 },
    { name: '其他问题', value: 5 },
  ],
  hourlyTrend: Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    count: Math.floor(Math.random() * 10) + (i >= 8 && i <= 20 ? 5 : 1),
  })),
};

export const alertList = [
  { id: 1, type: 'danger', message: '人民广场吸烟亭已满，请立即安排清理', time: '10分钟前', facilityId: 'fac-001' },
  { id: 2, type: 'danger', message: '火车站吸烟室设施损坏，需要维修', time: '25分钟前', facilityId: 'fac-003' },
  { id: 3, type: 'warning', message: '中央公园烟蒂柱即将满，建议今日清理', time: '1小时前', facilityId: 'fac-002' },
  { id: 4, type: 'warning', message: '购物中心吸烟区人流密集，建议增加巡检', time: '2小时前', facilityId: 'fac-004' },
  { id: 5, type: 'info', message: '体育馆烟蒂柱已超过3天未清理', time: '3小时前', facilityId: 'fac-005' },
];

export const schedulerSuggestions = [
  { id: 1, priority: 'high', suggestion: '建议优先处理东城区人民广场区域的满溢设施', facilities: 3, estimatedTime: '1.5小时' },
  { id: 2, priority: 'medium', suggestion: '西城区设施整体状态良好，可按计划巡检', facilities: 2, estimatedTime: '1小时' },
  { id: 3, priority: 'medium', suggestion: '朝阳区新增3条上报工单，请及时分派', facilities: 5, estimatedTime: '2.5小时' },
];
