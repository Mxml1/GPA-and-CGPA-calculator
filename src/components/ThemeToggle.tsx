import { useEffect, useState } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';

export type Theme = 'light' | 'dark' | 'system';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (t: Theme) => {
      root.classList.remove('light', 'dark');
      let resolved = t;
      if (t === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      root.classList.add(resolved);
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const activeAppearance = theme === 'system' ? (isSystemDark ? 'dark' : 'light') : theme;

  const handleToggle = () => {
    if (theme === 'system') {
      setTheme(isSystemDark ? 'light' : 'dark');
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  return (
    <div className="relative flex items-center">
      <button
        onClick={handleToggle}
        className="h-9 w-9 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center border border-border/80 shadow-sm"
        title={activeAppearance === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {activeAppearance === 'dark' ? (
          <Sun size={18} className="text-amber-500" />
        ) : (
          <Moon size={18} className="text-indigo-600 dark:text-indigo-400" />
        )}
      </button>

      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="h-9 px-3 ml-1 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center border border-border/80 text-xs font-bold uppercase tracking-wider min-w-[3.5rem] shadow-sm select-none"
        title="Select Theme Mode"
      >
        {theme === 'system' ? 'Sys' : theme}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-2 w-36 bg-card border border-border/80 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <button
              onClick={() => {
                setTheme('light');
                setShowDropdown(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center space-x-2 transition-colors ${theme === 'light' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'}`}
            >
              <Sun size={15} />
              <span>Light</span>
            </button>
            <button
              onClick={() => {
                setTheme('dark');
                setShowDropdown(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center space-x-2 transition-colors ${theme === 'dark' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'}`}
            >
              <Moon size={15} />
              <span>Dark</span>
            </button>
            <button
              onClick={() => {
                setTheme('system');
                setShowDropdown(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center space-x-2 transition-colors ${theme === 'system' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'}`}
            >
              <Laptop size={15} />
              <span>System</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
