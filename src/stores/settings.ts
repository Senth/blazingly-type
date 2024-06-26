import { Settings } from "@models/settings";
import { create } from "zustand";

interface SettingsStore {
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

const useSettingsStore = create<SettingsStore>((set) => ({
  settings: Settings.New(),
  setSettings: (settings: Settings) => set({ settings }),
}));

export default useSettingsStore;
