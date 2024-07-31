import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TimerStore {
  elapsedSeconds: number;
  elapsedTotalSeconds: number;
  lastKeystrokeTime?: number;
  lastUpdateTime?: number;
  keyPressed(): void;
  resetExercise(): void;
  resetTotal(): void;
  getElapsedTime(): string;
  getTotalElapsedTime(): string;
}

const pauseAfter = 5000;

const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => {
      function updateElapsedSeconds() {
        let {
          elapsedSeconds,
          elapsedTotalSeconds,
          lastKeystrokeTime,
          lastUpdateTime,
        } = get();
        const now = Date.now();
        const elapsed = Math.round((now - (lastUpdateTime || now)) / 1000);

        // Still actively typing
        if (lastKeystrokeTime && lastKeystrokeTime >= now - pauseAfter) {
          setTimeout(updateElapsedSeconds, 1000);
        }

        set({
          elapsedSeconds: elapsedSeconds + elapsed,
          elapsedTotalSeconds: elapsedTotalSeconds + elapsed,
          lastUpdateTime: now,
        });
      }

      return {
        elapsedSeconds: 0,
        elapsedTotalSeconds: 0,
        keyPressed(): void {
          const { lastKeystrokeTime } = get();
          const now = Date.now();

          const diffSinceLastKeyStroke = now - (lastKeystrokeTime || 0);
          if (diffSinceLastKeyStroke > pauseAfter) {
            setTimeout(updateElapsedSeconds, 1000);
            set({
              lastKeystrokeTime: now,
              lastUpdateTime: now,
            });
          } else {
            set({
              lastKeystrokeTime: now,
            });
          }
        },
        resetExercise(): void {
          set({
            elapsedSeconds: 0,
            lastKeystrokeTime: undefined,
            lastUpdateTime: undefined,
          });
        },
        resetTotal(): void {
          set({
            elapsedSeconds: 0,
            elapsedTotalSeconds: 0,
            lastKeystrokeTime: undefined,
            lastUpdateTime: undefined,
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
