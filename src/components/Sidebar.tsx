import React from 'react';
import { TrendingUp, ArrowLeftRight, Wallet, BarChart3, Settings, ShieldAlert, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: { name: string; role: string; id: string } | null;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'Markets', label: 'Markets', icon: TrendingUp },
    { id: 'Trade', label: 'Trade', icon: ArrowLeftRight },
    { id: 'Portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'Research', label: 'Research', icon: BarChart3 },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 fixed left-0 top-0 h-screen bg-surface-low border-r border-outline-variant flex flex-col py-4 z-50">
      {/* Brand Anchor Header */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <span className="font-sans font-extrabold text-on-primary text-lg">QV</span>
          </div>
          <div>
            <h1 className="font-sans text-xl font-bold text-primary tracking-tight leading-none">QuantVault</h1>
            <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest leading-none mt-1">
              Institutional Terminal
            </p>
          </div>
        </div>
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 py-2 px-4 rounded text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'text-primary font-bold bg-surface-container-highest border-r-2 border-primary'
                      : 'text-on-surface-variant font-medium hover:bg-surface-container-highest hover:text-on-surface'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} />
                  <span className="text-xs">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profile / Footer Card */}
      {user ? (
        <div className="mt-auto px-4 pt-4 border-t border-outline-variant flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xs select-none">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-xs text-on-surface truncate leading-tight">{user.name}</p>
              <p className="text-[10px] text-on-surface-variant truncate uppercase tracking-wider">{user.role}</p>
              <p className="text-[8px] text-on-surface-variant/70 font-mono tracking-widest">{user.id}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-1.5 px-3 bg-surface-container-high border border-outline-variant rounded text-left text-xs text-on-surface-variant font-semibold hover:bg-surface-container-highest hover:text-error transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminate Session</span>
          </button>
        </div>
      ) : (
        <div className="mt-auto px-4 pt-4 border-t border-[#334155] flex flex-col items-center gap-1 opacity-50">
          <ShieldAlert className="w-5 h-5 text-on-surface-variant" />
          <p className="text-[9px] uppercase font-mono">Secured Sandbox</p>
        </div>
      )}
    </aside>
  );
}
