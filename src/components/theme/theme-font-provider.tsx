'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light';
export type FontChoice = 'space-grotesk' | 'bricolage' | 'montserrat' | 'jersey-10';

interface ThemeFontContextType {
  theme: ThemeMode;
  font: FontChoice;
  setTheme: (theme: ThemeMode) => void;
  setFont: (font: FontChoice) => void;
  toggleTheme: () => void;
}

const ThemeFontContext = createContext<ThemeFontContextType | undefined>(undefined);

export function ThemeFontProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [font, setFontState] = useState<FontChoice>('space-grotesk');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('pitchpulse_theme') as ThemeMode | null;
    const savedFont = localStorage.getItem('pitchpulse_font') as FontChoice | null;

    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    if (savedFont && ['space-grotesk', 'bricolage', 'montserrat', 'jersey-10'].includes(savedFont)) {
      setFontState(savedFont);
      document.documentElement.setAttribute('data-font', savedFont);
    } else {
      document.documentElement.setAttribute('data-font', 'space-grotesk');
    }
  }, []);

  function setTheme(newTheme: ThemeMode) {
    setThemeState(newTheme);
    localStorage.setItem('pitchpulse_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }

  function setFont(newFont: FontChoice) {
    setFontState(newFont);
    localStorage.setItem('pitchpulse_font', newFont);
    document.documentElement.setAttribute('data-font', newFont);
  }

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  return (
    <ThemeFontContext.Provider value={{ theme, font, setTheme, setFont, toggleTheme }}>
      {children}
    </ThemeFontContext.Provider>
  );
}

export function useThemeFont() {
  const context = useContext(ThemeFontContext);
  if (!context) {
    return {
      theme: 'dark' as ThemeMode,
      font: 'space-grotesk' as FontChoice,
      setTheme: () => {},
      setFont: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}
