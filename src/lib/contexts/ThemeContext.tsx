import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<'light' | 'dark'>(colorScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    if (themeMode === 'system') {
      setTheme(colorScheme === 'dark' ? 'dark' : 'light');
    } else {
      setTheme(themeMode);
    }
  }, [themeMode, colorScheme]);

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
