import { ExerciseGeneration, Exercises, Scopes } from "@models/exercise";
import { defaultLessons, Lesson } from "@models/lesson";
import { create } from "zustand";

interface ExerciseStore extends Exercises {
  setLesson(lesson: Lesson): void;
  setFromModel: (exercises: Exercises) => void;
  nextExercise: () => void;
  getCurrentWords: () => string[];
  getUniqueWords: () => string[];
  setGeneration: (generation: ExerciseGeneration) => void;
  setScope: (scope: Scopes) => void;
}

const useExerciseStore = create<ExerciseStore>((set, get) => ({
  lesson: defaultLessons[0],
  setLesson: (lesson: Lesson) => {
    const allExercises = generateExercise({ ...get(), lesson });
    set({ lesson, allExercises, currentExerciseIndex: 0 });
  },
  setFromModel: (exercises: Exercises) => set({ ...exercises }),
  allExercises: [],
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
    repetitions: 4,
  },
  setGeneration: (generation: ExerciseGeneration) => {
    if (generation.combinations <= 0 || generation.repetitions <= 0) {
      return;
    }

    const allExercises = generateExercise({ ...get(), generation });
    set({ generation, allExercises, currentExerciseIndex: 0 });
  },
  scope: Scopes.worst50,
  setScope: (scope: Scopes) => {
    const allExercises = generateExercise({ ...get(), scope });
    set({ scope, allExercises, currentExerciseIndex: 0 });
  },
}));

export default useExerciseStore;

function generateExercise(exercises: Exercises): string[][] {
  let words = [...exercises.lesson.words];

  // TODO Sort by worst words
  // Randomize words order
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  words = scopeWords(words, exercises.scope);

  exercises.allExercises = [];
  const { combinations, repetitions } = exercises.generation;
  let exerciseLength = words.length / combinations;
  if (exerciseLength % 1 !== 0) {
    exerciseLength = Math.ceil(exerciseLength);
  }
  for (let i = 0; i < words.length; i += combinations) {
    const exercise: string[] = [];

    for (let r = 0; r < repetitions; r++) {
      for (let j = 0; j < combinations; j++) {
        if (i + j < words.length) {
          exercise.push(words[i + j]);
        }
      }
    }

    exercises.allExercises.push(exercise);
  }

  return exercises.allExercises;
}

function scopeWords(words: string[], scope: Scopes): string[] {
  switch (scope) {
    case Scopes.worst50:
      if (words.length > 50) {
        words.splice(50);
      }
      break;
    case Scopes.worst100:
      if (words.length > 100) {
        words.splice(100);
      }
      break;
    case Scopes.worst150:
      if (words.length > 150) {
        words.splice(150);
      }
      break;
    case Scopes.worst10percent:
      const tenPercent = Math.ceil(words.length * 0.1);
      if (words.length > tenPercent) {
        words.splice(tenPercent);
      }
      break;
    case Scopes.worst20percent:
      const twentyPercent = Math.ceil(words.length * 0.2);
      if (words.length > twentyPercent) {
        words.splice(twentyPercent);
      }
      break;
    case Scopes.worst30percent:
      const thirtyPercent = Math.ceil(words.length * 0.3);
      if (words.length > thirtyPercent) {
        words.splice(thirtyPercent);
      }
      break;
  }
  return words;
}
