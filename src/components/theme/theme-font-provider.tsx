'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'dark';
export type FontChoice = 'space-grotesk' | 'bricolage' | 'montserrat' | 'jersey-10';

interface ThemeFontContextType {
  theme: 'dark';
  font: FontChoice;
  setTheme: (theme: 'dark') => void;
  setFont: (font: FontChoice) => void;
  toggleTheme: () => void;
}

const ThemeFontContext = createContext<ThemeFontContextType | undefined>(undefined);

export function ThemeFontProvider({ children }: { children: React.ReactNode }) {
  const [font, setFontState] = useState<FontChoice>('space-grotesk');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const savedFont = localStorage.getItem('pitchpulse_font') as FontChoice | null;

    if (savedFont && ['space-grotesk', 'bricolage', 'montserrat', 'jersey-10'].includes(savedFont)) {
      setFontState(savedFont);
      document.documentElement.setAttribute('data-font', savedFont);
    } else {
      document.documentElement.setAttribute('data-font', 'space-grotesk');
    }
  }, []);

  function setFont(newFont: FontChoice) {
    setFontState(newFont);
    localStorage.setItem('pitchpulse_font', newFont);
    document.documentElement.setAttribute('data-font', newFont);
  }

  return (
    <ThemeFontContext.Provider
      value={{
        theme: 'dark',
        font,
        setTheme: () => {},
        setFont,
        toggleTheme: () => {},
      }}
    >
      {children}
    </ThemeFontContext.Provider>
  );
}

export function useThemeFont() {
  const context = useContext(ThemeFontContext);
  if (!context) {
    return {
      theme: 'dark' as const,
      font: 'space-grotesk' as FontChoice,
      setTheme: () => {},
      setFont: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}
