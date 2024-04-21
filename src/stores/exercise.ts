import { create } from "zustand";

interface ExerciseStore {
  allExercises: string[][];
  setAllExercises: (exercises: string[][]) => void;
  currentExerciseIndex: number;
  nextExercise: () => void;
}

const useExerciseStore = create<ExerciseStore>((set) => ({
  allExercises: [],
  setAllExercises: (exercises: string[][]) =>
    set({ allExercises: exercises, currentExerciseIndex: 0 }),
  currentExerciseIndex: 0,
  nextExercise: () => {
    set((state) => {
      if (state.currentExerciseIndex < state.allExercises.length - 1) {
        return { currentExerciseIndex: state.currentExerciseIndex + 1 };
      }
      return { currentExerciseIndex: state.currentExerciseIndex };
    });
  },
}));

export default useExerciseStore;
