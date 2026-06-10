import React, { useState } from 'react';
import { Search, Bell, User, Check, X } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  assetCategory: 'equity' | 'crypto' | 'fx' | 'derivatives';
  setAssetCategory: (category: 'equity' | 'crypto' | 'fx' | 'derivatives') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  latency?: number;
}

export default function Header({
  activeTab,
  assetCategory,
  setAssetCategory,
  searchTerm,
  setSearchTerm,
  latency = 12
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Limit buy order fully filled: 4.2 BTC @ $28,451.20', read: false, time: '2m ago' },
    { id: 2, text: 'NVIDIA quarterly earnings yield beat projections by 8.4%', read: false, time: '15m ago' },
    { id: 3, text: 'Risk mitigation alert: Hedging Put option triggered successfully', read: true, time: '2h ago' },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const categories: { id: 'equity' | 'crypto' | 'fx' | 'derivatives'; label: string }[] = [
    { id: 'equity', label: 'Equity' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'fx', label: 'FX' },
    { id: 'derivatives', label: 'Derivatives' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="fixed top-0 right-0 left-64 h-12 bg-surface border-b border-outline-variant flex justify-between items-center px-4 z-40">
      {/* Asset Switcher or Page Title */}
      <div className="flex items-center gap-6">
        <span className="font-sans text-sm font-bold text-on-surface uppercase tracking-wider">{activeTab}</span>
        
        {/* Only show sub-asset tabs when on Markets, Portfolio, or Trade screens */}
        {['Markets', 'Portfolio', 'Trade', 'Research'].includes(activeTab) && (
          <nav className="flex gap-4">
            {categories.map((cat) => {
              const isActive = assetCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setAssetCategory(cat.id)}
                  className={`font-sans text-[10px] uppercase font-bold tracking-wider cursor-pointer pb-1 transition-all ${
                    isActive
                      ? 'text-primary border-b border-primary'
                      : 'text-on-surface-variant hover:text-primary-container'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Global search, notifications, profile status */}
      <div className="flex items-center gap-4 relative">
        {/* Instant Ticker Filter Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-on-surface-variant" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-7 bg-surface-container border border-outline-variant rounded px-2 pl-8 py-1 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-0 outline-none w-48 transition-all font-mono"
            placeholder="Search symbols..."
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2 text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Latency Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 bg-surface-container-low border border-outline-variant rounded select-none text-[10px] font-mono font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
          <span className="text-on-surface-variant/80">LATENCY:</span>
          <span className="text-primary font-bold">{latency}ms</span>
        </div>

        {/* Notifications Icon with Indicator */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded-full border border-transparent hover:border-outline-variant hover:bg-surface-container-high transition-colors flex items-center justify-center text-on-surface-variant hover:text-primary cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FB923C] rounded-full border border-surface"></span>
            )}
          </button>

          {/* Quick Notification Dropdown panel */}
          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-surface-container-high border border-outline-variant rounded-md shadow-2xl p-3 z-50 animate-fadeIn font-sans">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant mb-2">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Alert Logs</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-primary hover:underline cursor-pointer"
                  >
                    Clear unread
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-2 rounded text-xs transition-colors ${
                      notif.read ? 'bg-surface-container-low/50 text-on-surface-variant' : 'bg-surface-container-highest/60 text-on-surface font-semibold border-l-2 border-primary'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="leading-tight">{notif.text}</p>
                    </div>
                    <span className="text-[9px] font-mono text-on-surface-variant/60 block text-right">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Trigger */}
        <button className="w-8 h-8 rounded-full border border-outline-variant hover:border-primary hover:bg-surface-container border-dashed transition-colors flex items-center justify-center text-on-surface-variant hover:text-primary cursor-pointer select-none">
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
