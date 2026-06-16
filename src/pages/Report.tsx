
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Camera, 
  MapPin, 
  Send, 
  CheckCircle, 
  AlertTriangle,
  Trash2,
  Hammer,
  Package,
  HelpCircle,
  ChevronLeft,
  Upload
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { workOrderTypeLabels } from '../utils';
import { createWorkOrder } from '../data/workorders';
import type { WorkOrderType } from '../types';
import { cn } from '../lib/utils';

const issueTypes: { value: WorkOrderType; label: string; icon: typeof AlertTriangle; color: string }[] = [
  { value: 'overflow', label: '烟蒂满溢', icon: Trash2, color: 'text-red-500 bg-red-50' },
  { value: 'damage', label: '设施损坏', icon: Hammer, color: 'text-orange-500 bg-orange-50' },
  { value: 'missing_bag', label: '缺少烟蒂袋', icon: Package, color: 'text-yellow-500 bg-yellow-50' },
  { value: 'other', label: '其他问题', icon: HelpCircle, color: 'text-smoke-500 bg-smoke-50' },
];

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addWorkOrder } = useAppStore();
  
  const state = location.state as { facilityId?: string; facilityName?: string } | null;
  
  const [step, setStep] = useState<'select' | 'form' | 'success'>('select');
  const [selectedType, setSelectedType] = useState<WorkOrderType | null>(null);
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [orderNo, setOrderNo] = useState('');

  const facilityId = state?.facilityId || '';
  const facilityName = state?.facilityName || '请选择设施';

  const handleTypeSelect = (type: WorkOrderType) => {
    setSelectedType(type);
    setStep('form');
  };

  const handleImageUpload = () => {
    const newImage = `https://picsum.photos/200/200?random=${Date.now()}`;
    setImages([...images, newImage]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType) return;

    const newOrder = createWorkOrder({
      facilityId,
      facilityName,
      type: selectedType,
      description,
      images,
      reporterName: reporterName || '匿名市民',
      reporterPhone,
    });
    
    addWorkOrder(newOrder);
    setOrderNo(newOrder.orderNo);
    setStep('success');
  };

  const resetForm = () => {
    setStep('select');
    setSelectedType(null);
    setDescription('');
    setReporterName('');
    setReporterPhone('');
    setImages([]);
  };

  return (
    <div className="min-h-full bg-smoke-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {step !== 'select' && (
          <button
            onClick={() => step === 'form' ? setStep('select') : resetForm()}
            className="flex items-center gap-2 text-smoke-600 hover:text-smoke-800 mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            返回
          </button>
        )}

        {step === 'select' && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-smoke-800 mb-2">问题上报</h1>
            <p className="text-smoke-500 mb-6">请选择您要上报的问题类型</p>

            <div className="bg-white rounded-xl p-4 shadow-card mb-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-brand-accent" />
                <div className="flex-1">
                  <p className="text-sm text-smoke-500">上报设施</p>
                  <p className="font-medium text-smoke-800">{facilityName}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {issueTypes.map((issue) => {
                const Icon = issue.icon;
                return (
                  <button
                    key={issue.value}
                    onClick={() => handleTypeSelect(issue.value)}
                    className="bg-white rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5 text-left"
                  >
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-3', issue.color)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-medium text-smoke-800">{issue.label}</h3>
                    <p className="text-xs text-smoke-400 mt-1">
                      {issue.value === 'overflow' && '烟蒂收集器已满或溢出'}
                      {issue.value === 'damage' && '设施破损、部件损坏'}
                      {issue.value === 'missing_bag' && '需要补充烟蒂收集袋'}
                      {issue.value === 'other' && '其他相关问题'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'form' && selectedType && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-smoke-800 mb-2">填写上报信息</h1>
            <p className="text-smoke-500 mb-6">
              问题类型：<span className="text-brand-accent font-medium">{workOrderTypeLabels[selectedType]}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-xl p-5 shadow-card">
                <h3 className="font-medium text-smoke-800 mb-4 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-smoke-400" />
                  现场照片
                </h3>
                <div className="flex flex-wrap gap-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-smoke-200 flex flex-col items-center justify-center text-smoke-400 hover:border-brand-accent hover:text-brand-accent transition-colors"
                    >
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-xs">上传</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-smoke-400 mt-2">最多上传5张照片</p>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-card">
                <h3 className="font-medium text-smoke-800 mb-4">问题描述</h3>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="请详细描述问题情况，以便我们更好地处理..."
                  className="w-full h-32 p-3 border border-smoke-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
                />
                <p className="text-xs text-smoke-400 mt-2 text-right">{description.length}/500</p>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-card">
                <h3 className="font-medium text-smoke-800 mb-4">联系方式（选填）</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-smoke-600 mb-1.5">您的称呼</label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="匿名市民"
                      className="w-full px-4 py-2.5 border border-smoke-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-smoke-600 mb-1.5">联系电话</label>
                    <input
                      type="tel"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      placeholder="用于接收处理进度通知"
                      className="w-full px-4 py-2.5 border border-smoke-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-health-danger text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/25"
              >
                <Send className="w-5 h-5" />
                提交上报
              </button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="animate-bounce-in text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-health-good" />
            </div>
            <h2 className="text-2xl font-bold text-smoke-800 mb-2">上报成功</h2>
            <p className="text-smoke-500 mb-4">感谢您的反馈，我们会尽快处理</p>
            
            <div className="bg-white rounded-xl p-5 shadow-card inline-block mb-8 text-left">
              <p className="text-sm text-smoke-500 mb-1">工单编号</p>
              <p className="text-xl font-mono font-bold text-brand-accent">{orderNo}</p>
              <p className="text-xs text-smoke-400 mt-2">预计2小时内响应处理</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/workorders')}
                className="w-full py-3 bg-brand-accent text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                查看工单进度
              </button>
              <button
                onClick={resetForm}
                className="w-full py-3 bg-white text-smoke-600 rounded-xl font-medium hover:bg-smoke-50 transition-colors border border-smoke-200"
              >
                继续上报
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
