import { create } from 'zustand';
import type { AppSettings } from '@/types/api';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/constants';
import { getFromStorage, saveToStorage } from '@/utils/storage';

interface SettingsState {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  toggleDarkMode: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: getFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
  updateSettings: (partial) => {
    const newSettings = { ...get().settings, ...partial };
    saveToStorage(STORAGE_KEYS.SETTINGS, newSettings);
    set({ settings: newSettings });
  },
  toggleDarkMode: () => {
    const { settings } = get();
    const newDarkMode = !settings.darkMode;
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    get().updateSettings({ darkMode: newDarkMode });
  },
}));
