
import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { TrendingUp, Clock, AlertTriangle, MapPin, BarChart3 } from 'lucide-react';
import StatCard from '../components/Charts/StatCard';
import { dashboardStats } from '../data/statistics';
import { useAppStore } from '../store/appStore';

export default function Dashboard() {
  const { currentRole } = useAppStore();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const barChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dashboardStats.districtDistribution.map((d) => d.name),
      axisLine: { lineStyle: { color: '#dee2e6' } },
      axisLabel: { color: '#6c757d', fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f1f3f5' } },
      axisLabel: { color: '#6c757d', fontSize: 12 },
    },
    series: [
      {
        name: '设施数量',
        type: 'bar',
        data: dashboardStats.districtDistribution.map((d) => d.value),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#3498DB' },
              { offset: 1, color: '#2980B9' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '50%',
      },
    ],
  };

  const lineChartOption = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['满溢率', '响应时间'],
      top: 0,
      textStyle: { color: '#6c757d', fontSize: 12 },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dashboardStats.overflowTrend.map((d) => d.date),
      axisLine: { lineStyle: { color: '#dee2e6' } },
      axisLabel: { color: '#6c757d', fontSize: 12 },
    },
    yAxis: [
      {
        type: 'value',
        name: '满溢率(%)',
        splitLine: { lineStyle: { color: '#f1f3f5' } },
        axisLabel: { color: '#6c757d', fontSize: 12 },
        nameTextStyle: { color: '#6c757d', fontSize: 12 },
      },
      {
        type: 'value',
        name: '响应(分钟)',
        splitLine: { show: false },
        axisLabel: { color: '#6c757d', fontSize: 12 },
        nameTextStyle: { color: '#6c757d', fontSize: 12 },
      },
    ],
    series: [
      {
        name: '满溢率',
        type: 'line',
        smooth: true,
        data: dashboardStats.overflowTrend.map((d) => d.rate),
        itemStyle: { color: '#E74C3C' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(231, 76, 60, 0.3)' },
              { offset: 1, color: 'rgba(231, 76, 60, 0.05)' },
            ],
          },
        },
        symbolSize: 6,
      },
      {
        name: '响应时间',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: dashboardStats.responseTimeTrend.map((d) => d.time),
        itemStyle: { color: '#3498DB' },
        symbolSize: 6,
      },
    ],
  };

  const pieChartOption = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#6c757d', fontSize: 12 },
    },
    series: [
      {
        name: '设施类型',
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#2C3E50',
          },
        },
        labelLine: {
          show: false,
        },
        data: dashboardStats.facilityTypeDistribution.map((d, i) => ({
          ...d,
          itemStyle: {
            color: ['#3498DB', '#2ECC71', '#F39C12'][i],
          },
        })),
      },
    ],
  };

  const statusPieOption = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#6c757d', fontSize: 12 },
    },
    series: [
      {
        name: '状态分布',
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['35%', '50%'],
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        labelLine: { show: false },
        data: dashboardStats.statusDistribution.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: { color: d.color },
        })),
      },
    ],
  };

  const barHourlyOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dashboardStats.hourlyTrend.map((d) => d.hour),
      axisLine: { lineStyle: { color: '#dee2e6' } },
      axisLabel: { color: '#6c757d', fontSize: 10, interval: 2 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f1f3f5' } },
      axisLabel: { color: '#6c757d', fontSize: 12 },
    },
    series: [
      {
        name: '上报数量',
        type: 'bar',
        data: dashboardStats.hourlyTrend.map((d) => d.count),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#9B59B6' },
              { offset: 1, color: '#8E44AD' },
            ],
          },
          borderRadius: [3, 3, 0, 0],
        },
        barWidth: '60%',
      },
    ],
  };

  return (
    <div className="min-h-full bg-smoke-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-smoke-800 mb-1">数据看板</h1>
            <p className="text-smoke-500">
              {currentRole === 'admin' ? '全局数据统计与分析' : '设施运行数据概览'}
            </p>
          </div>
          <div className="flex bg-white rounded-lg p-1 shadow-card">
            {(['day', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 text-sm rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-brand-accent text-white shadow-sm'
                    : 'text-smoke-500 hover:text-smoke-700'
                }`}
              >
                {range === 'day' ? '今日' : range === 'week' ? '本周' : '本月'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={isLoaded ? 'animate-fade-in' : 'opacity-0'} style={{ animationDelay: '0.1s' }}>
            <StatCard
              title="设施总数"
              value={dashboardStats.totalFacilities}
              unit="个"
              trend="up"
              trendValue="+2.3%"
              icon={<MapPin className="w-6 h-6 text-blue-500" />}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
          </div>
          <div className={isLoaded ? 'animate-fade-in' : 'opacity-0'} style={{ animationDelay: '0.2s' }}>
            <StatCard
              title="满溢率"
              value={dashboardStats.overflowRate}
              unit="%"
              trend="down"
              trendValue="-1.5%"
              icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
              color="text-red-600"
              bgColor="bg-red-50"
            />
          </div>
          <div className={isLoaded ? 'animate-fade-in' : 'opacity-0'} style={{ animationDelay: '0.3s' }}>
            <StatCard
              title="平均响应时间"
              value={dashboardStats.avgResponseTime}
              unit="分钟"
              trend="down"
              trendValue="-5分钟"
              icon={<Clock className="w-6 h-6 text-green-500" />}
              color="text-green-600"
              bgColor="bg-green-50"
            />
          </div>
          <div className={isLoaded ? 'animate-fade-in' : 'opacity-0'} style={{ animationDelay: '0.4s' }}>
            <StatCard
              title="今日上报"
              value={dashboardStats.todayReports}
              unit="件"
              trend="up"
              trendValue="+3件"
              icon={<BarChart3 className="w-6 h-6 text-purple-500" />}
              color="text-purple-600"
              bgColor="bg-purple-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-card">
            <h3 className="font-medium text-smoke-800 mb-4">各区域设施分布</h3>
            <ReactECharts option={barChartOption} style={{ height: '300px' }} />
          </div>
          <div className="bg-white rounded-xl p-5 shadow-card">
            <h3 className="font-medium text-smoke-800 mb-4">设施类型占比</h3>
            <ReactECharts option={pieChartOption} style={{ height: '300px' }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-card">
            <h3 className="font-medium text-smoke-800 mb-4">满溢率与响应时间趋势</h3>
            <ReactECharts option={lineChartOption} style={{ height: '300px' }} />
          </div>
          <div className="bg-white rounded-xl p-5 shadow-card">
            <h3 className="font-medium text-smoke-800 mb-4">容量状态分布</h3>
            <ReactECharts option={statusPieOption} style={{ height: '300px' }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-card">
            <h3 className="font-medium text-smoke-800 mb-4">24小时上报分布</h3>
            <ReactECharts option={barHourlyOption} style={{ height: '280px' }} />
          </div>
          <div className="bg-white rounded-xl p-5 shadow-card">
            <h3 className="font-medium text-smoke-800 mb-4">工单类型分布</h3>
            <div className="space-y-3">
              {dashboardStats.workOrderTypeDistribution.map((item, index) => {
                const total = dashboardStats.workOrderTypeDistribution.reduce((sum, i) => sum + i.value, 0);
                const percentage = Math.round((item.value / total) * 100);
                const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-smoke-500'];
                return (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-smoke-600">{item.name}</span>
                      <span className="text-smoke-800 font-medium">{item.value}件 ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-smoke-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[index]} transition-all duration-1000`}
                        style={{ width: isLoaded ? `${percentage}%` : '0%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
