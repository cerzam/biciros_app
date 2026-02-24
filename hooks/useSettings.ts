import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  // Tema
  darkMode: boolean;

  // Notificaciones
  notificacionesVentas: boolean;
  notificacionesStock: boolean;
  notificacionesServicios: boolean;

  // Información del negocio
  nombreNegocio: string;
  direccionNegocio: string;
  telefonoNegocio: string;
}

const defaultSettings: AppSettings = {
  darkMode: true,
  notificacionesVentas: true,
  notificacionesStock: true,
  notificacionesServicios: true,
  nombreNegocio: 'BICIROS',
  direccionNegocio: '',
  telefonoNegocio: '',
};

const SETTINGS_KEY = '@biciros_settings';

interface UseSettingsReturn {
  settings: AppSettings;
  loading: boolean;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Cargar configuraciones al iniciar
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error guardando configuraciones:', error);
      throw error;
    }
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<void> => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const updateSettings = async (newSettings: Partial<AppSettings>): Promise<void> => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await saveSettings(updated);
  };

  const resetSettings = async (): Promise<void> => {
    setSettings(defaultSettings);
    await saveSettings(defaultSettings);
  };

  return {
    settings,
    loading,
    updateSetting,
    updateSettings,
    resetSettings,
  };
};
