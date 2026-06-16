
import type { WorkOrder, WorkOrderStatus, WorkOrderPriority, WorkOrderType } from '../types';

const typeLabels: Record<WorkOrderType, string> = {
  overflow: '烟蒂满溢',
  damage: '设施损坏',
  missing_bag: '缺少烟蒂袋',
  other: '其他问题',
};

const priorityLabels: Record<WorkOrderPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

const statusLabels: Record<WorkOrderStatus, string> = {
  pending: '待处理',
  assigned: '已派单',
  processing: '处理中',
  completed: '已完成',
  cancelled: '已取消',
};

const reporters = ['张先生', '李女士', '王先生', '赵女士', '陈先生', '刘女士', '周先生', '吴女士'];
const cleaners = ['张保洁', '李保洁', '王保洁', '赵保洁', '陈保洁'];
const districts = ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区'];

function generateOrderNo(index: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 7));
  const dateStr = date.toISOString().substring(0, 10).replace(/-/g, '');
  return `WO${dateStr}${String(index + 1).padStart(4, '0')}`;
}

function formatDate(daysAgo: number, hoursAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString().replace('T', ' ').substring(0, 16);
}

export const workOrders: WorkOrder[] = Array.from({ length: 35 }, (_, i) => {
  const types: WorkOrderType[] = ['overflow', 'damage', 'missing_bag', 'other'];
  const statuses: WorkOrderStatus[] = ['pending', 'assigned', 'processing', 'completed', 'cancelled'];
  const priorities: WorkOrderPriority[] = ['low', 'medium', 'high', 'urgent'];
  
  const type = types[i % types.length];
  const statusIndex = Math.floor(i / 7);
  const status = statuses[Math.min(statusIndex, statuses.length - 1)];
  const priority = priorities[Math.floor(Math.random() * priorities.length)];
  const district = districts[i % districts.length];
  
  const order: WorkOrder = {
    id: `order-${String(i + 1).padStart(3, '0')}`,
    orderNo: generateOrderNo(i),
    facilityId: `fac-${String((i % 50) + 1).padStart(3, '0')}`,
    facilityName: `设施点 ${String(i + 1).padStart(3, '0')}`,
    type,
    description: getDescription(type),
    images: [],
    reporterName: reporters[i % reporters.length],
    reporterPhone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    status,
    priority,
    createTime: formatDate(Math.floor(Math.random() * 5), Math.floor(Math.random() * 24)),
    district,
  };

  if (status !== 'pending') {
    order.assignTime = formatDate(Math.floor(Math.random() * 3), Math.floor(Math.random() * 12));
    order.cleanerId = `cleaner-${String((i % 5) + 1).padStart(2, '0')}`;
    order.cleanerName = cleaners[i % cleaners.length];
  }

  if (status === 'processing' || status === 'completed') {
    order.processTime = formatDate(Math.floor(Math.random() * 2), Math.floor(Math.random() * 8));
  }

  if (status === 'completed') {
    order.completeTime = formatDate(Math.floor(Math.random() * 1), Math.floor(Math.random() * 4));
    order.remark = '已完成清理，设施状态恢复正常';
  }

  return order;
});

function getDescription(type: WorkOrderType): string {
  switch (type) {
    case 'overflow':
      return '烟蒂收集器已满，烟蒂散落周围地面，请尽快清理。';
    case 'damage':
      return '设施外壳有破损，烟灰缸松动，需要维修。';
    case 'missing_bag':
      return '烟蒂袋用完了，需要补充新的烟蒂袋。';
    case 'other':
      return '设施周边有杂物堆放，影响使用。';
    default:
      return '';
  }
}

export { typeLabels, priorityLabels, statusLabels };

export function getWorkOrderById(id: string): WorkOrder | undefined {
  return workOrders.find(w => w.id === id);
}

export function getWorkOrdersByStatus(status: WorkOrderStatus): WorkOrder[] {
  return workOrders.filter(w => w.status === status);
}

export function getWorkOrdersByCleaner(cleanerId: string): WorkOrder[] {
  return workOrders.filter(w => w.cleanerId === cleanerId);
}

let nextOrderId = 100;

export function createWorkOrder(data: Partial<WorkOrder>): WorkOrder {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const newOrder: WorkOrder = {
    id: `order-${String(nextOrderId++).padStart(3, '0')}`,
    orderNo: `WO${new Date().toISOString().substring(0, 10).replace(/-/g, '')}${String(nextOrderId).padStart(4, '0')}`,
    facilityId: data.facilityId || '',
    facilityName: data.facilityName || '未命名设施',
    type: data.type || 'other',
    description: data.description || '',
    images: data.images || [],
    reporterName: data.reporterName || '匿名市民',
    reporterPhone: data.reporterPhone || '',
    status: 'pending',
    priority: data.priority || 'medium',
    createTime: now,
    district: data.district,
  };
  workOrders.unshift(newOrder);
  return newOrder;
}

export function updateWorkOrderStatus(id: string, status: WorkOrderStatus): WorkOrder | null {
  const order = workOrders.find(w => w.id === id);
  if (!order) return null;
  
  order.status = status;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  
  if (status === 'assigned') order.assignTime = now;
  if (status === 'processing') order.processTime = now;
  if (status === 'completed') order.completeTime = now;
  
  return order;
}
