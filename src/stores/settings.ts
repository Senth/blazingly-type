import { migrateSettings, Settings, SettingsExercise } from "@models/settings";
import { create } from "zustand";
import { persistDBAndCache } from "./dbCacheMiddleware";
import { getUserId } from "@auth";
import dayjs from "dayjs";

interface SettingsStore extends Settings {
  setExercise: (exerciseSettings: SettingsExercise) => void;
  formatDate: (date: Date) => string;
}

const useSettingsStore = create<SettingsStore>()(
  persistDBAndCache(
    (set, get) => ({
      ...Settings.New(),
      setExercise: (exerciseSettings: SettingsExercise) =>
        set((state) => ({
          ...state,
          exercise: exerciseSettings,
        })),
      formatDate: (date: Date): string => {
        return dayjs(date).format(get().locale.dateFormat);
      },
    }),
    {
      name: "settings",
      version: Settings.version,
      userId: getUserId(),
      cacheExpiryInMinutes: 60,
      migrate: migrateSettings,
    },
  ),
);

export default useSettingsStore;

export const settingsActions = {
  exercise: useSettingsStore.getState().exercise,
};
