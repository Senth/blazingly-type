import { Settings, SettingsExercise } from "@models/settings";
import { create } from "zustand";

interface SettingsStore {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  setExercise: (exerciseSettings: SettingsExercise) => void;
}

const useSettingsStore = create<SettingsStore>((set) => ({
  settings: Settings.New(),
  setSettings: (settings: Settings) => set({ settings }),
  setExercise: (exerciseSettings: SettingsExercise) =>
    set((state) => ({
      settings: { ...state.settings, exercise: exerciseSettings },
    })),
}));

export default useSettingsStore;

export const settingsActions = {
  settings: useSettingsStore.getState().settings,
};
