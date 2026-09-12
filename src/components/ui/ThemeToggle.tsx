'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Color Theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun className={`w-4 h-4 transition-all duration-300 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100 text-amber-500'}`} />
        <Moon className={`w-4 h-4 absolute transition-all duration-300 ${isDark ? 'rotate-0 scale-100 opacity-100 text-indigo-400' : '-rotate-90 scale-0 opacity-0'}`} />
      </div>
    </button>
  );
}
