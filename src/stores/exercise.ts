import { ExerciseGeneration, Exercises, Scopes } from "@models/exercise";
import { Lesson } from "@models/lesson";
import { create } from "zustand";

interface ExerciseStore extends Exercises {
  lesson?: Lesson;
  setLesson(lesson: Lesson): void;
  setFromModel: (exercises: Exercises) => void;
  setAllExercises: (exercises: string[][]) => void;
  nextExercise: () => void;
  getCurrentWords: () => string[];
  getUniqueWords: () => string[];
  setGeneration: (generation: ExerciseGeneration) => void;
  setScope: (scope: Scopes) => void;
}

const useExerciseStore = create<ExerciseStore>((set, get) => ({
  lesson: undefined,
  setLesson: (lesson: Lesson) => set({ lesson }),
  setFromModel: (exercises: Exercises) => set({ ...exercises }),
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
  generation: {
    combinations: 2,
    repetition: 4,
  },
  setGeneration: (generation: ExerciseGeneration) => set({ generation }),
  scope: Scopes.worst50,
  setScope: (scope: Scopes) => set({ scope }),
}));

export default useExerciseStore;
