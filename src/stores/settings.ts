import { Settings, SettingsExercise } from "@models/settings";
import { create } from "zustand";
import { persistDBAndCache } from "./dbCacheMiddleware";
import { getUserId } from "@auth";

interface SettingsStore extends Settings {
  setExercise: (exerciseSettings: SettingsExercise) => void;
}

const useSettingsStore = create<SettingsStore>()(
  persistDBAndCache(
    (set) => ({
      ...Settings.New(),
      setExercise: (exerciseSettings: SettingsExercise) =>
        set((state) => ({
          ...state,
          exercise: exerciseSettings,
        })),
    }),
    {
      name: "settings",
      version: Settings.version,
      userId: getUserId(),
      cacheExpiryInMinutes: 60,
    },
  ),
);

export default useSettingsStore;

export const settingsActions = {
  exercise: useSettingsStore.getState().exercise,
};
