
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Map,
  BarChart3,
  FileText,
  ClipboardList,
  Users,
  Menu,
  X,
  Cigarette,
  Settings2,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../lib/utils';
import RoleSwitcher from './RoleSwitcher';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { currentRole } = useAppStore();

  const citizenNavItems = [
    { path: '/', icon: Map, label: '地图首页' },
    { path: '/report', icon: FileText, label: '问题上报' },
    { path: '/workorders', icon: ClipboardList, label: '我的工单' },
  ];

  const cleanerNavItems = [
    { path: '/cleaner', icon: ClipboardList, label: '工单管理' },
    { path: '/', icon: Map, label: '地图导航' },
  ];

  const adminNavItems = [
    { path: '/admin', icon: BarChart3, label: '监控总览' },
    { path: '/facilities', icon: Settings2, label: '设施管理' },
    { path: '/dashboard', icon: BarChart3, label: '数据看板' },
    { path: '/workorders', icon: ClipboardList, label: '工单管理' },
    { path: '/', icon: Map, label: '设施地图' },
  ];

  const navItems = currentRole === 'citizen'
    ? citizenNavItems
    : currentRole === 'cleaner'
    ? cleanerNavItems
    : adminNavItems;

  return (
    <div
      className={cn(
        'h-full bg-smoke-800 text-white flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-smoke-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Cigarette className="w-6 h-6 text-health-warning" />
            <span className="font-bold text-lg">烟蒂地图</span>
          </div>
        )}
        {collapsed && <Cigarette className="w-6 h-6 text-health-warning mx-auto" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-smoke-700 transition-colors"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-brand-accent text-white shadow-lg'
                      : 'text-smoke-300 hover:bg-smoke-700 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-smoke-700 p-3">
        <RoleSwitcher collapsed={collapsed} />
      </div>

      <div className="border-t border-smoke-700 p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-smoke-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {currentRole === 'citizen' ? '市民用户' : currentRole === 'cleaner' ? '张保洁' : '管理员'}
              </p>
              <p className="text-xs text-smoke-400">
                {currentRole === 'citizen' ? '市民' : currentRole === 'cleaner' ? '保洁员' : '管理员'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
