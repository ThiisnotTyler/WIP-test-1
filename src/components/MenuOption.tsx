import React from 'react';
import { ChevronRight } from 'lucide-react';
import { playSound } from '../utils/audio';

export function MenuOption({ label, icon: Icon, onClick, isActive }: any) {
  return (
    <button 
      onClick={() => {
        playSound('select');
        onClick();
      }}
      className={`group relative flex items-center justify-between w-full text-left py-3 px-6 rounded-full transition-all duration-200 border-2 ${
        isActive 
          ? 'bg-accent border-accent shadow-[0_4px_15px_rgba(var(--theme-accent-rgb),0.3)] scale-[1.02] z-10' 
          : 'bg-panel border-transparent hover:bg-accent hover:border-accent hover:shadow-[0_4px_15px_rgba(var(--theme-accent-rgb),0.3)] hover:scale-[1.02]'
      }`}
    >
      <div className={`flex items-center gap-4 ${isActive ? 'text-text-inv' : 'text-text-main group-hover:text-text-inv'} transition-colors`}>
        {Icon && <Icon className="w-6 h-6" />}
        <span className="text-xl font-extrabold tracking-wide">{label}</span>
      </div>
      <ChevronRight className={`w-6 h-6 ${isActive ? 'text-text-inv' : 'text-text-main/30 group-hover:text-text-inv'} transition-colors`} />
    </button>
  );
}
