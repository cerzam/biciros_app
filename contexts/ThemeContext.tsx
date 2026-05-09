import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Colores del tema oscuro (actual)
export const darkTheme = {
  background: '#0a0a0a',
  backgroundGradient: ['#111111', '#0d0d0d', '#0a0a0a'] as [string, string, string],
  cardBackground: 'rgba(28, 28, 28, 0.9)',
  cardBackgroundAlt: 'rgba(18, 18, 18, 0.8)',
  modalBackground: '#1c1c1c',
  textPrimary: '#ffffff',
  textSecondary: '#c0c0c0',
  textMuted: '#6b6b6b',
  primary: '#D4AF37',
  primaryGradient: ['#D4AF37', '#A67C00'] as [string, string],
  success: '#34d399',
  warning: '#fbbf24',
  error: '#ef4444',
  info: '#3b82f6',
  border: 'rgba(255, 255, 255, 0.08)',
  navBackground: ['rgba(10, 10, 10, 0.97)', 'rgba(5, 5, 5, 0.97)'] as [string, string],
  navText: '#6b6b6b',
  navTextActive: '#D4AF37',
};

// Colores del tema claro
export const lightTheme = {
  background: '#f8fafc',
  backgroundGradient: ['#e2e8f0', '#f1f5f9', '#f8fafc'] as [string, string, string],
  cardBackground: 'rgba(255, 255, 255, 0.9)',
  cardBackgroundAlt: 'rgba(241, 245, 249, 0.9)',
  modalBackground: '#ffffff',
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
