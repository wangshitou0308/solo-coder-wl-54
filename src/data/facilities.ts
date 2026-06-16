
import type { Facility, FacilityStatus, HealthLevel } from '../types';

const districts = ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区'];
const facilityNames = [
  '人民广场吸烟亭', '中央公园烟蒂柱', '火车站吸烟室', '购物中心吸烟区',
  '体育馆烟蒂柱', '地铁站吸烟亭', '医院户外吸烟区', '学校周边烟蒂柱',
  '商业街吸烟亭', '科技园烟蒂柱', '滨江路吸烟区', '古城墙烟蒂柱',
  '市民广场吸烟亭', '政务中心烟蒂柱', '图书馆户外吸烟区', '博物馆烟蒂柱',
  '公园北门吸烟亭', '会展中心烟蒂柱', '体育中心吸烟区', '机场T2吸烟室'
];

const statusMap: Record<FacilityStatus, HealthLevel> = {
  empty: 'good',
  half: 'good',
  nearly_full: 'warning',
  full: 'danger',
};

function getRandomStatus(): FacilityStatus {
  const rand = Math.random();
  if (rand < 0.35) return 'empty';
  if (rand < 0.65) return 'half';
  if (rand < 0.85) return 'nearly_full';
  return 'full';
}

function getRandomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function formatDate(daysAgo: number, hoursAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString().replace('T', ' ').substring(0, 16);
}

export const facilities: Facility[] = Array.from({ length: 50 }, (_, i) => {
  const type = i % 3 === 0 ? 'indoor_room' : i % 3 === 1 ? 'outdoor_pavilion' : 'standalone_pillar';
  const status = getRandomStatus();
  const currentLevel = status === 'empty' 
    ? Math.floor(getRandomInRange(0, 25))
    : status === 'half'
    ? Math.floor(getRandomInRange(25, 50))
    : status === 'nearly_full'
    ? Math.floor(getRandomInRange(50, 80))
    : Math.floor(getRandomInRange(80, 100));

  return {
    id: `fac-${String(i + 1).padStart(3, '0')}`,
    code: `YD-${String(i + 1).padStart(4, '0')}`,
    name: facilityNames[i % facilityNames.length] + (i >= facilityNames.length ? ` ${Math.floor(i / facilityNames.length) + 1}号` : ''),
    type,
    status,
    healthLevel: statusMap[status],
    lat: getRandomInRange(39.8, 39.98),
    lng: getRandomInRange(116.25, 116.55),
    address: `${districts[i % districts.length]}${['人民路', '中山路', '建国路', '解放路', '和平路', '建设路'][i % 6]}${i + 1}号`,
    district: districts[i % districts.length],
    capacity: type === 'standalone_pillar' ? 500 : type === 'outdoor_pavilion' ? 1000 : 2000,
    currentLevel,
    lastCleanTime: formatDate(Math.floor(Math.random() * 3), Math.floor(Math.random() * 12)),
    crowdDensity: (['low', 'medium', 'high', 'very_high'] as const)[Math.floor(Math.random() * 4)],
    hasAshtray: type !== 'standalone_pillar',
    hasTrashBin: Math.random() > 0.3,
    maintenanceDate: formatDate(Math.floor(Math.random() * 90) + 30, 0).substring(0, 10),
  };
});

export function getFacilityById(id: string): Facility | undefined {
  return facilities.find(f => f.id === id);
}

export function getFacilitiesByDistrict(district: string): Facility[] {
  if (!district || district === 'all') return facilities;
  return facilities.filter(f => f.district === district);
}

export function getDistricts(): string[] {
  return [...new Set(facilities.map(f => f.district))];
}
