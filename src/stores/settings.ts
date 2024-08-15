import { Settings, SettingsExercise } from "@models/settings";
import { create } from "zustand";
import { persistDBAndCache } from "./dbCacheMiddleware";
import { getUserId } from "@auth";

interface SettingsStore {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  setExercise: (exerciseSettings: SettingsExercise) => void;
}

const useSettingsStore = create<SettingsStore>()(
  persistDBAndCache(
    (set) => ({
      settings: Settings.New(),
      setSettings: (settings: Settings) => set({ settings }),
      setExercise: (exerciseSettings: SettingsExercise) =>
        set((state) => ({
          settings: { ...state.settings, exercise: exerciseSettings },
        })),
    }),
    {
      name: "settings",
      version: Settings.version,
      userId: getUserId(),
    },
  ),
);

export default useSettingsStore;

export const settingsActions = {
  settings: useSettingsStore.getState().settings,
};
