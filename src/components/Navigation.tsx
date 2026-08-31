import React from 'react';
import { Home, Play, Wallet, Users, ShieldCheck } from 'lucide-react';
import { ActiveTab } from '../types';
import { sounds } from '../utils/audio';

interface NavigationProps {
  activeTab: ActiveTab;
  isAdminUnlocked: boolean;
  pendingWithdrawalsCount?: number;
  onTabChange: (tab: ActiveTab) => void;
  onPlayClick: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  isAdminUnlocked,
  pendingWithdrawalsCount = 0,
  onTabChange,
  onPlayClick,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; isAction?: boolean; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-5 h-5" /> },
    { id: 'game', label: 'Play', icon: <Play className="w-5 h-5 fill-current" />, isAction: true },
    { id: 'referral', label: 'Referral', icon: <Users className="w-5 h-5" /> },
    ...(isAdminUnlocked
      ? [
          {
            id: 'admin' as ActiveTab,
            label: 'Payouts',
            icon: <ShieldCheck className="w-5 h-5" />,
            badge: pendingWithdrawalsCount,
          },
        ]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#020617]/95 backdrop-blur-xl border-t border-slate-800/90 px-2 py-1.5">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                id="nav-play-btn"
                onClick={() => {
                  sounds.playClick();
                  onPlayClick();
                }}
                className="flex flex-col items-center justify-center -mt-5 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-sky-500/25 border-2 border-[#020617] active:scale-90 transition-transform">
                  <Play className="w-5 h-5 fill-white translate-x-0.5" />
                </div>
                <span className="text-[10px] font-bold text-sky-400 mt-0.5">Play</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              id={`nav-${tab.id}-btn`}
              onClick={() => {
                sounds.playClick();
                onTabChange(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition relative ${
                isActive ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg transition relative ${isActive ? 'bg-sky-500/10' : ''}`}>
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'text-sky-400 font-black' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
