
import { useState, useEffect } from 'react';
import { X, MapPin, Save, Map as MapIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { Facility, FacilityType, FacilityStatus, CrowdDensity } from '../../types';
import { facilityTypeLabels, facilityStatusLabels } from '../../utils';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../lib/utils';

interface FacilityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingFacility?: Facility | null;
}

const defaultCenter: [number, number] = [39.9042, 116.4074];

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const customIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="width:32px;height:32px;background:#3B82F6;border-radius:50%;border:3px solid white;box-shadow:0 4px 12px rgba(59,130,246,0.4);display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function FacilityFormModal({ isOpen, onClose, editingFacility }: FacilityFormModalProps) {
  const { addFacility, updateFacility } = useAppStore();
  const [showMapPicker, setShowMapPicker] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'standalone_pillar' as FacilityType,
    address: '',
    district: '朝阳区',
    lat: 39.9042,
    lng: 116.4074,
    capacity: 100,
    currentLevel: 0,
    status: 'empty' as FacilityStatus,
    hasAshtray: true,
    hasTrashBin: true,
    crowdDensity: 'medium' as CrowdDensity,
    maintenanceDate: new Date().toISOString().substring(0, 10),
  });

  useEffect(() => {
    if (editingFacility) {
      setFormData({
        name: editingFacility.name,
        code: editingFacility.code,
        type: editingFacility.type,
        address: editingFacility.address,
        district: editingFacility.district,
        lat: editingFacility.lat,
        lng: editingFacility.lng,
        capacity: editingFacility.capacity,
        currentLevel: editingFacility.currentLevel,
        status: editingFacility.status,
        hasAshtray: editingFacility.hasAshtray,
        hasTrashBin: editingFacility.hasTrashBin,
        crowdDensity: editingFacility.crowdDensity,
        maintenanceDate: editingFacility.maintenanceDate.substring(0, 10),
      });
      setShowMapPicker(false);
    } else {
      setFormData({
        name: '',
        code: `FAC-${Date.now().toString().slice(-6)}`,
        type: 'standalone_pillar',
        address: '',
        district: '朝阳区',
        lat: 39.9042,
        lng: 116.4074,
        capacity: 100,
        currentLevel: 0,
        status: 'empty',
        hasAshtray: true,
        hasTrashBin: true,
        crowdDensity: 'medium',
        maintenanceDate: new Date().toISOString().substring(0, 10),
      });
      setShowMapPicker(true);
    }
  }, [editingFacility, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFacility) {
      updateFacility(editingFacility.id, { ...formData, lastCleanTime: editingFacility.lastCleanTime });
    } else {
      addFacility({
        ...formData,
        healthLevel: 'good',
        lastCleanTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      });
    }
    onClose();
  };

  const handleSelectOnMap = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-smoke-100 bg-gradient-to-r from-blue-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-smoke-800">
              {editingFacility ? '编辑设施' : '新建设施'}
            </h2>
            <p className="text-sm text-smoke-500 mt-0.5">
              {editingFacility ? '修改设施基础信息' : '填写设施信息，支持地图选点自动填充坐标'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-smoke-100 text-smoke-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                  设施名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：王府井步行街烟蒂柱A01"
                  className="w-full px-4 py-2.5 rounded-lg border border-smoke-200 focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                  设施编号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-smoke-200 focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-smoke-700 mb-1.5">设施类型</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as FacilityType })}
                    className="w-full px-4 py-2.5 rounded-lg border border-smoke-200 focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                  >
                    {Object.entries(facilityTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-smoke-700 mb-1.5">所属区域</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-smoke-200 focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                  >
                    {['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                  详细地址 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="请输入详细地址"
                  className="w-full px-4 py-2.5 rounded-lg border border-smoke-200 focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-smoke-700 mb-1.5">总容量（个）</label>
                  <input
                    type="number"
                    min={10}
                    max={1000}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 100 })}
                    className="w-full px-4 py-2.5 rounded-lg border border-smoke-200 focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-smoke-700 mb-1.5">初始状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as FacilityStatus })}
                    className="w-full px-4 py-2.5 rounded-lg border border-smoke-200 focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                  >
                    {Object.entries(facilityStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-smoke-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="hasAshtray"
                    checked={formData.hasAshtray}
                    onChange={(e) => setFormData({ ...formData, hasAshtray: e.target.checked })}
                    className="w-4 h-4 accent-brand-accent"
                  />
                  <label htmlFor="hasAshtray" className="text-sm font-medium text-smoke-700 cursor-pointer">
                    配有烟灰缸
                  </label>
                </div>
                <div className="flex items-center gap-3 p-3 bg-smoke-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="hasTrashBin"
                    checked={formData.hasTrashBin}
                    onChange={(e) => setFormData({ ...formData, hasTrashBin: e.target.checked })}
                    className="w-4 h-4 accent-brand-accent"
                  />
                  <label htmlFor="hasTrashBin" className="text-sm font-medium text-smoke-700 cursor-pointer">
                    配有垃圾桶
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-smoke-700">
                  坐标位置 <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    showMapPicker
                      ? 'bg-brand-accent text-white'
                      : 'bg-smoke-100 text-smoke-700 hover:bg-smoke-200'
                  )}
                >
                  <MapIcon className="w-4 h-4" />
                  {showMapPicker ? '收起地图' : '地图选点'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-smoke-500 mb-1">纬度 (Latitude)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-smoke-200 focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-smoke-500 mb-1">经度 (Longitude)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-smoke-200 focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none font-mono text-sm"
                  />
                </div>
              </div>

              {showMapPicker && (
                <div className="rounded-xl overflow-hidden border border-smoke-200 shadow-inner">
                  <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-accent" />
                    <span className="text-xs font-medium text-smoke-700">
                      点击地图任意位置选择设施坐标
                    </span>
                  </div>
                  <div className="h-80" style={{ zIndex: 1 }}>
                    <MapContainer
                      center={[formData.lat, formData.lng]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                      <MapClickHandler onSelect={handleSelectOnMap} />
                      <Marker
                        position={[formData.lat, formData.lng]}
                        icon={customIcon}
                      />
                    </MapContainer>
                  </div>
                </div>
              )}

              <div className="p-4 bg-gradient-to-br from-smoke-50 to-white rounded-xl border border-smoke-100">
                <h4 className="text-sm font-medium text-smoke-700 mb-3 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-brand-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                  设施预览信息
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-smoke-500">当前容量占用</span>
                    <span className="font-medium text-smoke-700">{formData.currentLevel}%</span>
                  </div>
                  <div className="h-2 bg-smoke-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        formData.currentLevel < 50 ? 'bg-green-500' :
                        formData.currentLevel < 80 ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                      style={{ width: `${formData.currentLevel}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.currentLevel}
                    onChange={(e) => setFormData({ ...formData, currentLevel: parseInt(e.target.value) })}
                    className="w-full mt-2 accent-brand-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-smoke-100 bg-smoke-50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-smoke-200 text-smoke-700 font-medium hover:bg-white transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent text-white font-medium hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              {editingFacility ? '保存修改' : '创建设施'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
