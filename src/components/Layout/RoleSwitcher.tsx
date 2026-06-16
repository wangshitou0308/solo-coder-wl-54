
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Brush, Shield } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { UserRole } from '../../types';
import { cn } from '../../lib/utils';

interface RoleSwitcherProps {
  collapsed?: boolean;
}

const roles: { value: UserRole; label: string; icon: typeof User; color: string }[] = [
  { value: 'citizen', label: '市民模式', icon: User, color: 'text-blue-400' },
  { value: 'cleaner', label: '保洁模式', icon: Brush, color: 'text-green-400' },
  { value: 'admin', label: '管理模式', icon: Shield, color: 'text-orange-400' },
];

export default function RoleSwitcher({ collapsed = false }: RoleSwitcherProps) {
  const { currentRole, setRole } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentRoleData = roles.find((r) => r.value === currentRole) || roles[0];
  const Icon = currentRoleData.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setRole(role);
    setIsOpen(false);
  };

  if (collapsed) {
    return (
      <div className="relative flex justify-center" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-smoke-700 transition-colors"
        >
          <Icon className={cn('w-5 h-5', currentRoleData.color)} />
        </button>
        {isOpen && (
          <div className="absolute left-full top-0 ml-2 bg-smoke-700 rounded-lg shadow-panel py-2 z-50 animate-slide-in-right">
            {roles.map((role) => {
              const RoleIcon = role.icon;
              return (
                <button
                  key={role.value}
                  onClick={() => handleRoleChange(role.value)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap transition-colors',
                    currentRole === role.value
                      ? 'bg-brand-accent text-white'
                      : 'text-smoke-300 hover:bg-smoke-600 hover:text-white'
                  )}
                >
                  <RoleIcon className={cn('w-4 h-4', role.color)} />
                  {role.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-smoke-700 hover:bg-smoke-600 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4', currentRoleData.color)} />
          <span className="text-sm">{currentRoleData.label}</span>
        </div>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-smoke-700 rounded-lg shadow-panel py-2 z-50 animate-fade-in">
          {roles.map((role) => {
            const RoleIcon = role.icon;
            return (
              <button
                key={role.value}
                onClick={() => handleRoleChange(role.value)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                  currentRole === role.value
                    ? 'bg-brand-accent text-white'
                    : 'text-smoke-300 hover:bg-smoke-600 hover:text-white'
                )}
              >
                <RoleIcon className={cn('w-4 h-4', role.color)} />
                {role.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
