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
          ? 'bg-[#050816] text-[#F4F7FF]' 
          : 'bg-[#F5F9FF] text-[#15243B]'
      }`}>
        {/* Restrained decorative particles canvas / overlay */}
        <ThemeParticlesOverlay theme={theme} />
        <div className="relative z-10 w-full min-h-screen flex flex-col">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

// Subtle background particles component:
// - Light Theme: tiny fluorescent blue sprinkles/sparkles
// - Dark Theme: deep cosmic sky with glowing stars & gradient highlights
const ThemeParticlesOverlay: React.FC<{ theme: Theme }> = ({ theme }) => {
  return (
    <div 
      aria-hidden="true" 
      className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none transition-opacity duration-700"
    >
      {theme === 'light' ? (
        // Light Theme: subtle sparkling blue sprinkles
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-[8%] left-[12%] w-1.5 h-1.5 rounded-full bg-[#00A8FF] blur-[0.5px] animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute top-[22%] right-[15%] w-2 h-2 rounded-full bg-[#176BFF] blur-[0.5px] opacity-60 animate-ping" style={{ animationDuration: '4s' }} />
          <div className="absolute top-[45%] left-[6%] w-1 h-1 rounded-full bg-[#00D9FF] animate-pulse" style={{ animationDuration: '2.5s' }} />
          <div className="absolute top-[68%] right-[8%] w-1.5 h-1.5 rounded-full bg-[#00A8FF] blur-[0.5px] opacity-70 animate-pulse" style={{ animationDuration: '3.5s' }} />
          <div className="absolute top-[85%] left-[25%] w-2 h-2 rounded-full bg-[#176BFF] blur-[1px] opacity-50 animate-ping" style={{ animationDuration: '5s' }} />
          <div className="absolute top-[35%] right-[32%] w-1 h-1 rounded-full bg-[#00A8FF] opacity-75" />
          <div className="absolute top-[75%] left-[45%] w-1.5 h-1.5 rounded-full bg-[#00D9FF] opacity-60 animate-pulse" style={{ animationDuration: '2.8s' }} />
        </div>
      ) : (
        // Dark Theme: deep cosmic space with glowing stars and gentle cyan/fluorescent blue highlights
        <div className="absolute inset-0">
          {/* Subtle cosmic starfield layer */}
          <div className="absolute inset-0 cosmic-starfield opacity-40" />

          {/* Top midnight glow & bottom fluorescent blue ambiance */}
          <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#00A8FF]/10 via-[#050816]/30 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-[450px] bg-gradient-to-t from-[#00A8FF]/12 via-[#0B1530]/20 to-transparent pointer-events-none" />

          {/* Gentle twinkling cosmic stars (low key, non-distracting) */}
          <div className="absolute top-[8%] left-[14%] w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] opacity-80 animate-pulse" style={{ animationDuration: '3.2s' }} />
          <div className="absolute top-[16%] right-[18%] w-1 h-1 rounded-full bg-white shadow-[0_0_5px_#ffffff] opacity-70 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-[28%] left-[25%] w-2 h-2 rounded-full bg-[#00A8FF] blur-[0.5px] shadow-[0_0_10px_#00A8FF] opacity-60 animate-pulse" style={{ animationDuration: '5s' }} />
          <div className="absolute top-[42%] right-[8%] w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] opacity-75 animate-pulse" style={{ animationDuration: '3.6s' }} />
          <div className="absolute top-[60%] left-[8%] w-1 h-1 rounded-full bg-white opacity-60" />
          <div className="absolute bottom-[24%] right-[22%] w-2 h-2 rounded-full bg-[#00A8FF] blur-[0.5px] shadow-[0_0_12px_#00A8FF] opacity-70 animate-pulse" style={{ animationDuration: '4.2s' }} />
          <div className="absolute bottom-[14%] left-[18%] w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] opacity-80 animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-[6%] right-[38%] w-1 h-1 rounded-full bg-white opacity-70 animate-pulse" style={{ animationDuration: '4.5s' }} />
        </div>
      )}
    </div>
  );
};
