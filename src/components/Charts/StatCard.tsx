
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: string;
  bgColor?: string;
}

export default function StatCard({
  title,
  value,
  unit,
  trend,
  trendValue,
  icon,
  color = 'text-brand-accent',
  bgColor = 'bg-blue-50',
}: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' 
    ? 'text-health-good' 
    : trend === 'down' 
    ? 'text-health-danger' 
    : 'text-smoke-400';

  return (
    <div className="bg-white rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-smoke-500 mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className={cn('text-2xl font-bold', color)}>{value}</span>
            {unit && <span className="text-sm text-smoke-400">{unit}</span>}
          </div>
        </div>
        {icon && (
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', bgColor)}>
            {icon}
          </div>
        )}
      </div>
      
      {trend && trendValue && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <TrendIcon className={cn('w-3.5 h-3.5', trendColor)} />
          <span className={trendColor}>{trendValue}</span>
          <span className="text-smoke-400">较昨日</span>
        </div>
      )}
    </div>
  );
}
