
import { useState } from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  MapPin,
  ChevronRight,
  Bell,
  Settings,
  Users,
  Zap
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { alertList, schedulerSuggestions, dashboardStats } from '../data/statistics';
import { workOrderStatusLabels, formatDateTime } from '../utils';
import { workOrders } from '../data/workorders';
import { cn } from '../lib/utils';
import StatCard from '../components/Charts/StatCard';

export default function AdminView() {
  const { facilities } = useAppStore();
  const [activeAlertId, setActiveAlertId] = useState<number | null>(null);

  const dangerFacilities = facilities.filter((f) => f.healthLevel === 'danger').length;
  const warningFacilities = facilities.filter((f) => f.healthLevel === 'warning').length;
  const pendingWorkOrders = workOrders.filter((w) => w.status === 'pending').length;
  const todayCompleted = workOrders.filter((w) => {
    if (w.status !== 'completed' || !w.completeTime) return false;
    const today = new Date().toISOString().substring(0, 10);
    return w.completeTime.startsWith(today);
  }).length;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'danger': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="min-h-full bg-smoke-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-smoke-800 mb-1">监控总览</h1>
            <p className="text-smoke-500">全局设施状态与调度管理</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 bg-white rounded-lg shadow-card hover:shadow-card-hover transition-all">
              <Bell className="w-5 h-5 text-smoke-500" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                5
              </span>
            </button>
            <button className="p-2 bg-white rounded-lg shadow-card hover:shadow-card-hover transition-all">
              <Settings className="w-5 h-5 text-smoke-500" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="设施总数"
            value={dashboardStats.totalFacilities}
            unit="个"
            trend="up"
            trendValue="+2 个"
            icon={<MapPin className="w-6 h-6 text-blue-500" />}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            title="告警设施"
            value={dangerFacilities + warningFacilities}
            unit="个"
            trend="down"
            trendValue="-3 个"
            icon={<AlertTriangle className="w-6 h-6 text-orange-500" />}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
          <StatCard
            title="待处理工单"
            value={pendingWorkOrders}
            unit="件"
            trend="up"
            trendValue="+5 件"
            icon={<Clock className="w-6 h-6 text-yellow-500" />}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
          />
          <StatCard
            title="今日完成"
            value={todayCompleted}
            unit="件"
            trend="up"
            trendValue="+2 件"
            icon={<TrendingUp className="w-6 h-6 text-green-500" />}
            color="text-green-600"
            bgColor="bg-green-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-5 shadow-card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-smoke-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  实时告警
                </h3>
                <button className="text-sm text-brand-accent hover:underline">查看全部</button>
              </div>
              <div className="space-y-3">
                {alertList.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => setActiveAlertId(activeAlertId === alert.id ? null : alert.id)}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all',
                      getAlertBg(alert.type),
                      activeAlertId === alert.id && 'ring-2 ring-brand-accent'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-smoke-800">{alert.message}</p>
                        <p className="text-xs text-smoke-500 mt-1">{alert.time}</p>
                      </div>
                      <ChevronRight className={cn(
                        'w-4 h-4 text-smoke-400 transition-transform flex-shrink-0',
                        activeAlertId === alert.id && 'rotate-90'
                      )} />
                    </div>
                    {activeAlertId === alert.id && (
                      <div className="mt-3 pt-3 border-t border-white/50 flex gap-2 animate-fade-in">
                        <button className="flex-1 py-1.5 bg-white/80 text-smoke-700 text-sm rounded hover:bg-white transition-colors">
                          查看详情
                        </button>
                        <button className="flex-1 py-1.5 bg-brand-accent text-white text-sm rounded hover:bg-blue-600 transition-colors">
                          立即派单
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-smoke-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  智能调度建议
                </h3>
              </div>
              <div className="space-y-3">
                {schedulerSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-4 bg-gradient-to-r from-smoke-50 to-white rounded-lg border border-smoke-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded',
                          getPriorityColor(suggestion.priority)
                        )}>
                          {suggestion.priority === 'high' ? '高优' : '中优'}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-smoke-800">{suggestion.suggestion}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-smoke-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {suggestion.facilities}个设施
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              预计{suggestion.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 bg-brand-accent text-white text-xs rounded-lg hover:bg-blue-600 transition-colors">
                        执行调度
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-5 shadow-card">
              <h3 className="font-medium text-smoke-800 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-smoke-400" />
                保洁员状态
              </h3>
              <div className="space-y-3">
                {['张保洁', '李保洁', '王保洁', '赵保洁'].map((name, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-smoke-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-smoke-200 flex items-center justify-center">
                        <Users className="w-4 h-4 text-smoke-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-smoke-800">{name}</p>
                        <p className="text-xs text-smoke-500">
                          {index === 0 ? '处理中' : index === 1 ? '空闲' : '处理中'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-smoke-800">
                        {index + 3} 单
                      </p>
                      <p className="text-xs text-smoke-400">今日完成</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-card">
              <h3 className="font-medium text-smoke-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-smoke-400" />
                区域健康度
              </h3>
              <div className="space-y-4">
                {['东城区', '西城区', '朝阳区', '海淀区', '丰台区'].map((district, index) => {
                  const healthPercent = 85 - index * 8;
                  const getBarColor = (percent: number) => {
                    if (percent >= 80) return 'bg-green-500';
                    if (percent >= 60) return 'bg-yellow-500';
                    return 'bg-red-500';
                  };
                  return (
                    <div key={district}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-smoke-600">{district}</span>
                        <span className="font-medium text-smoke-800">{healthPercent}%</span>
                      </div>
                      <div className="h-2 bg-smoke-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${getBarColor(healthPercent)}`}
                          style={{ width: `${healthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-brand-accent to-blue-600 rounded-xl p-5 text-white shadow-card">
              <h3 className="font-medium mb-3">快速操作</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="py-2.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors">
                  新建工单
                </button>
                <button className="py-2.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors">
                  批量派单
                </button>
                <button className="py-2.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors">
                  设施管理
                </button>
                <button className="py-2.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors">
                  数据报表
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
