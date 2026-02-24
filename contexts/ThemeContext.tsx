import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Colores del tema oscuro (actual)
export const darkTheme = {
  background: '#0d1117',
  backgroundGradient: ['#2a4a6a', '#1a2332', '#0d1117'] as [string, string, string],
  cardBackground: 'rgba(51, 65, 85, 0.6)',
  cardBackgroundAlt: 'rgba(30, 41, 59, 0.5)',
  textPrimary: '#fff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  primary: '#6366f1',
  primaryGradient: ['#6366f1', '#4f46e5'] as [string, string],
  success: '#34d399',
  warning: '#fbbf24',
  error: '#ef4444',
  info: '#3b82f6',
  border: 'rgba(255, 255, 255, 0.1)',
  navBackground: ['rgba(17, 24, 39, 0.95)', 'rgba(0, 0, 0, 0.95)'] as [string, string],
  navText: '#64748b',
  navTextActive: '#3b82f6',
};

// Colores del tema claro
export const lightTheme = {
  background: '#f8fafc',
  backgroundGradient: ['#e2e8f0', '#f1f5f9', '#f8fafc'] as [string, string, string],
  cardBackground: 'rgba(255, 255, 255, 0.9)',
  cardBackgroundAlt: 'rgba(241, 245, 249, 0.9)',
  textPrimary: '#1e293b',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  primary: '#6366f1',
  primaryGradient: ['#6366f1', '#4f46e5'] as [string, string],
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  border: 'rgba(0, 0, 0, 0.1)',
  navBackground: ['rgba(255, 255, 255, 0.98)', 'rgba(248, 250, 252, 0.98)'] as [string, string],
  navText: '#64748b',
  navTextActive: '#6366f1',
};

export type Theme = typeof darkTheme;

interface ThemeContextType {
  isDarkMode: boolean;
  theme: Theme;
  toggleTheme: () => void;
  setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = '@biciros_theme';

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Cargar preferencia de tema al iniciar
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored !== null) {
        setIsDarkMode(stored === 'dark');
      }
    } catch (error) {
      console.error('Error cargando preferencia de tema:', error);
    }
  };

  const saveThemePreference = async (isDark: boolean) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error guardando preferencia de tema:', error);
    }
  };

  const toggleTheme = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    saveThemePreference(newValue);
  };

  const setDarkMode = (value: boolean) => {
    setIsDarkMode(value);
    saveThemePreference(value);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    isDarkMode,
    theme,
    toggleTheme,
    setDarkMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
