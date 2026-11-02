import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return dataService.getThemePreference() || 'light';
  });

  useEffect(() => {
    // Sync with dataService when current user loads or changes
    const unsub = dataService.subscribe(() => {
      const saved = dataService.getThemePreference();
      if (saved && saved !== theme) {
        setThemeState(saved);
      }
    });
    return unsub;
  }, [theme]);

  useEffect(() => {
    // Apply class to html tag for Tailwind dark: modifiers
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    dataService.setThemePreference(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div className={`min-h-screen w-full transition-colors duration-300 relative ${
        theme === 'dark' 
          ? 'bg-[#050811] text-slate-100' 
          : 'bg-[#F8FAFC] text-slate-800'
      }`}>
        {/* Restrained decorative particles canvas / overlay */}
        <ThemeParticlesOverlay theme={theme} />
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Subtle background particles component:
// - Light Theme: tiny fluorescent blue sprinkles/sparkles
// - Dark Theme: deep glowing stars and falling sparkling particles near bottom
const ThemeParticlesOverlay: React.FC<{ theme: Theme }> = ({ theme }) => {
  return (
    <div 
      aria-hidden="true" 
      className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none opacity-40 transition-opacity duration-700"
    >
      {theme === 'light' ? (
        // Light Theme: subtle sparkling blue sprinkles
        <div className="absolute inset-0">
          <div className="absolute top-[8%] left-[12%] w-1.5 h-1.5 rounded-full bg-[#00A3FF] blur-[0.5px] animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute top-[22%] right-[15%] w-2 h-2 rounded-full bg-[#176BFF] blur-[0.5px] opacity-60 animate-ping" style={{ animationDuration: '4s' }} />
          <div className="absolute top-[45%] left-[6%] w-1 h-1 rounded-full bg-[#00D1FF] animate-pulse" style={{ animationDuration: '2.5s' }} />
          <div className="absolute top-[68%] right-[8%] w-1.5 h-1.5 rounded-full bg-[#00A3FF] blur-[0.5px] opacity-70 animate-pulse" style={{ animationDuration: '3.5s' }} />
          <div className="absolute top-[85%] left-[25%] w-2 h-2 rounded-full bg-[#176BFF] blur-[1px] opacity-50 animate-ping" style={{ animationDuration: '5s' }} />
          <div className="absolute top-[35%] right-[32%] w-1 h-1 rounded-full bg-[#00A3FF] opacity-75" />
          <div className="absolute top-[75%] left-[45%] w-1.5 h-1.5 rounded-full bg-[#00D1FF] opacity-60 animate-pulse" style={{ animationDuration: '2.8s' }} />
        </div>
      ) : (
        // Dark Theme: black deep space with electric-blue glow and star sprinkles towards bottom
        <div className="absolute inset-0">
          <div className="absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t from-[#00A3FF]/10 via-[#0A1A3F]/5 to-transparent pointer-events-none" />
          <div className="absolute top-[10%] left-[18%] w-1.5 h-1.5 rounded-full bg-cyan-300 blur-[0.5px] shadow-[0_0_8px_#00A3FF] animate-pulse" style={{ animationDuration: '2.2s' }} />
          <div className="absolute top-[18%] right-[22%] w-1 h-1 rounded-full bg-blue-400 blur-[0.5px] shadow-[0_0_6px_#176BFF] animate-pulse" style={{ animationDuration: '3.8s' }} />
          <div className="absolute top-[30%] left-[8%] w-2 h-2 rounded-full bg-[#00D1FF] blur-[1px] shadow-[0_0_10px_#00D1FF] animate-ping" style={{ animationDuration: '4.5s' }} />
          <div className="absolute top-[52%] right-[10%] w-1.5 h-1.5 rounded-full bg-cyan-200 blur-[0.5px] shadow-[0_0_8px_#00A3FF] animate-pulse" style={{ animationDuration: '2.8s' }} />
          <div className="absolute bottom-[20%] left-[15%] w-2 h-2 rounded-full bg-[#00A3FF] blur-[0.5px] shadow-[0_0_12px_#00A3FF] animate-pulse" style={{ animationDuration: '3.2s' }} />
          <div className="absolute bottom-[12%] right-[28%] w-2.5 h-2.5 rounded-full bg-[#176BFF] blur-[1px] shadow-[0_0_14px_#176BFF] animate-ping" style={{ animationDuration: '5s' }} />
          <div className="absolute bottom-[6%] left-[40%] w-1.5 h-1.5 rounded-full bg-cyan-300 blur-[0.5px] shadow-[0_0_8px_#00A3FF] animate-pulse" style={{ animationDuration: '2.6s' }} />
        </div>
      )}
    </div>
  );
};
