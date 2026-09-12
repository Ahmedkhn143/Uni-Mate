'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialTheme(): Theme {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('unimate_theme') as Theme | null;
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch (e) {}
  }
  return 'dark';
}

function applyThemeToDOM(t: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;

  root.setAttribute('data-theme', t);
  root.style.colorScheme = t;
  
  if (t === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    if (body) {
      body.setAttribute('data-theme', 'dark');
      body.classList.add('dark');
      body.classList.remove('light');
    }
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    if (body) {
      body.setAttribute('data-theme', 'light');
      body.classList.remove('dark');
      body.classList.add('light');
    }
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    // Initial DOM sync
    applyThemeToDOM(theme);

    // Watch for cross-tab theme changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'unimate_theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeState(e.newValue as Theme);
        applyThemeToDOM(e.newValue as Theme);
      }
    };
    window.addEventListener('storage', handleStorage);

    // MutationObserver to prevent Next.js / React 19 router hydration from wiping .dark class
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      const activeTheme = (localStorage.getItem('unimate_theme') as Theme) || theme || 'dark';
      const hasDarkClass = root.classList.contains('dark');
      const hasDataTheme = root.getAttribute('data-theme') === activeTheme;

      if (activeTheme === 'dark' && (!hasDarkClass || !hasDataTheme)) {
        applyThemeToDOM('dark');
      } else if (activeTheme === 'light' && (hasDarkClass || !hasDataTheme)) {
        applyThemeToDOM('light');
      }
    });

    observer.observe(root, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    return () => {
      window.removeEventListener('storage', handleStorage);
      observer.disconnect();
    };
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('unimate_theme', newTheme);
    } catch (e) {}
    applyThemeToDOM(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
