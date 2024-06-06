import { create } from "zustand";

interface ExerciseStore {
  allExercises: string[][];
  setAllExercises: (exercises: string[][]) => void;
  currentExerciseIndex: number;
  nextExercise: () => void;
  getCurrentWords: () => string[];
  getUniqueWords: () => string[];
}

const useExerciseStore = create<ExerciseStore>((set, get) => ({
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
  getCurrentWords: () => {
    const { allExercises, currentExerciseIndex } = get();
    if (currentExerciseIndex >= allExercises.length) {
      return [];
    }
    return allExercises[currentExerciseIndex];
  },
  getUniqueWords: () => {
    const { getCurrentWords } = get();
    const words = getCurrentWords();

    const uniqueWords: string[] = [];
    words.forEach((word) => {
      if (!uniqueWords.includes(word)) {
        uniqueWords.push(word);
      }
    });
    return uniqueWords;
  },
}));

export default useExerciseStore;
