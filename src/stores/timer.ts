import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TimerStore {
  elapsedSeconds: number;
  elapsedTotalSeconds: number;
  lastKeystrokeTime?: Date;
  lastUpdate?: Date;
  isRunning: boolean;
  keyPressed(): void;
  resetExercise(): void;
  resetTotal(): void;
  getElapsedTime(): string;
  getTotalElapsedTime(): string;
}

const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => {
      function updateElapsedSeconds() {
        let { elapsedSeconds, lastKeystrokeTime, lastUpdate, isRunning } =
          get();
        const now = new Date();
        const lastUpdateTime = lastUpdate ? lastUpdate.getTime() : 0;
        const elapsed = Math.round((now.getTime() - lastUpdateTime) / 1000);

        // Still actively typing
        if (
          lastKeystrokeTime &&
          lastKeystrokeTime.getTime() >= now.getTime() - 5000
        ) {
          setTimeout(updateElapsedSeconds, 1000);
        } else {
          isRunning = false;
        }

        set({
          elapsedSeconds: elapsedSeconds + elapsed,
          elapsedTotalSeconds: elapsedSeconds + elapsed,
          lastUpdate: now,
          isRunning,
        });
      }

      return {
        elapsedSeconds: 0,
        elapsedTotalSeconds: 0,
        isRunning: false,
        keyPressed(): void {
          const { isRunning } = get();
          if (!isRunning) {
            setTimeout(updateElapsedSeconds, 1000);
            set({
              lastKeystrokeTime: new Date(),
              lastUpdate: new Date(),
              isRunning: true,
            });
          } else {
            set({
              lastKeystrokeTime: new Date(),
              isRunning: true,
            });
          }
        },
        resetExercise(): void {
          set({
            elapsedSeconds: 0,
            lastKeystrokeTime: undefined,
            lastUpdate: undefined,
            isRunning: false,
          });
        },
        resetTotal(): void {
          set({
            elapsedSeconds: 0,
            elapsedTotalSeconds: 0,
            lastKeystrokeTime: undefined,
            lastUpdate: undefined,
            isRunning: false,
          });
        },
        getElapsedTime(): string {
          const { elapsedSeconds } = get();
          const minutes = Math.floor(elapsedSeconds / 60);
          const seconds = elapsedSeconds % 60;
          return `${minutes}:${seconds.toString().padStart(2, "0")}`;
        },
        getTotalElapsedTime(): string {
          const { elapsedTotalSeconds } = get();
          const minutes = Math.floor(elapsedTotalSeconds / 60);
          const seconds = elapsedTotalSeconds % 60;
          return `${minutes}:${seconds.toString().padStart(2, "0")}`;
        },
      };
    },
    {
      name: "timer",
    },
  ),
);

export default useTimerStore;

export const timerActions = {
  resetTotal: useTimerStore.getState().resetTotal,
  resetExercise: useTimerStore.getState().resetExercise,
};
