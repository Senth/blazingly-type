import { saveExercises } from "@db/user";
import { getWords } from "@db/word";
import {
  ExerciseGeneration,
  Exercises,
  MaxTime,
  OrderTypes,
} from "@models/exercise";
import { defaultLessons, Lesson } from "@models/lesson";
import { create } from "zustand";

export interface PreviousWord {
  word: string;
  wpm: string;
  targetWpm: string;
}

interface ExerciseStore extends Exercises {
  setLesson(lesson: Lesson): void;
  setFromModel(exercises: Exercises): void;
  nextExercise(skip?: boolean): void;
  getCurrentWords(): string[];
  getUniqueWords(): string[];
  setGeneration(generation: ExerciseGeneration): void;
  setMaxTime(maxTime: MaxTime): void;
  previousExercise: PreviousWord[];
  setPreviousExercise(previousExercise: PreviousWord[]): void;
  completed: boolean;
  elapsedTime: string;
  startTime?: Date;
  startTimer: () => void;
  timerId?: NodeJS.Timeout;
}

type Replacements = {
  [key: string]: any;
};

const useExerciseStore = create<ExerciseStore>((set, get) => {
  async function resetExercises(extra: Replacements) {
    const store = get();

    clearTimeout(store.timerId);

    const allExercises = await generateExercise({ ...store, ...extra });
    set({
      allExercises,
      currentExerciseIndex: 0,
      completed: false,
      elapsedTime: "",
      startTime: undefined,
      timerId: undefined,
      ...extra,
    });

    saveToDB({ ...extra, allExercises });
  }

  function saveToDB(extra: Replacements) {
    const store = get();
    const exercises = getExercises({ ...store, ...extra });
    saveExercises(exercises);
  }

  function getExercises(replace: Replacements): Exercises {
    const store = get();
    return {
      lesson: store.lesson,
      allExercises: store.allExercises,
      currentExerciseIndex: store.currentExerciseIndex,
      generation: store.generation,
      maxTime: store.maxTime,
      ...replace,
    };
  }

  return {
    lesson: defaultLessons[0],
    setLesson: async (lesson: Lesson) => {
      resetExercises({ lesson });
    },
    setFromModel: (exercises: Exercises) => set({ ...exercises }),
    allExercises: [],
    currentExerciseIndex: 0,
    nextExercise: (skip?: boolean) => {
      const store = get();
      let nextIndex = store.currentExerciseIndex + 1;
      let completed = store.completed;
      if (nextIndex >= store.allExercises.length) {
        nextIndex = 0;
        completed = true;
      }

      set({
        currentExerciseIndex: nextIndex,
        completed,
        elapsedTime: "",
        startTime: undefined,
        timerId: undefined,
      });

      if (!skip) {
        saveToDB({ currentExerciseIndex: nextIndex });
      }
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
      order: OrderTypes.Slowest,
      maxExercises: 20,
      maxExercisesEnabled: true,
    },
    setGeneration: async (generation: ExerciseGeneration) => {
      if (generation.combinations <= 0 || generation.repetitions <= 0) {
        return;
      }
      resetExercises({ generation });
    },
    maxTime: {
      minutes: 15,
      enabled: true,
    },
    setMaxTime: (maxTime: MaxTime) => {
      if (maxTime.minutes <= 0) {
        return;
      }
      set({ maxTime });
    },
    previousExercise: [],
    setPreviousExercise: (previousExercise: PreviousWord[]) =>
      set({ previousExercise }),
    completed: false,
    elapsedTime: "",
    startTimer: () => {
      set({ elapsedTime: "0:00", startTime: new Date() });

      function updateTimer() {
        const { startTime } = get();
        if (!startTime) {
          return;
        }

        let seconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
        const minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        const elapsedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        const timerId = setTimeout(updateTimer, 1000);
        set({ timerId, elapsedTime });
      }

      updateTimer();
    },
  };
});

export default useExerciseStore;

async function generateExercise(exercises: Exercises): Promise<string[][]> {
  const words = await randomizeAndScopeWords(exercises.lesson.words);

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

async function randomizeAndScopeWords(words: string[]): Promise<string[]> {
  // Fetch word statistics from the database
  const wordStats = await getWords(words);

  // Couldn't fetch word statistics, just randomize the words...
  if (wordStats.length !== words.length) {
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    return words;
  }

  // Create sort statistics: WPM * multiplier * days since last practiced
  const wordAndStats: [string, number][] = [];
  for (let i = 0; i < words.length; i++) {
    const lastWpm = wordStats[i].lastPracticeWpm;

    const differenceInTime =
      Date.now() - wordStats[i].lastPracticeDatetime.getTime();
    const daysSinceLastPracticed = differenceInTime / (1000 * 60 * 60 * 24);
    const decrease = 3 * daysSinceLastPracticed;

    const wordSortStat = lastWpm - decrease;

    wordAndStats.push([words[i], wordSortStat]);
  }

  // Sort the words by the sort statistics, lowest first
  wordAndStats.sort((a, b) => {
    return a[1] - b[1];
  });

  // Extract the words from the sorted array
  let sortedWords = wordAndStats.map((wordAndStat) => wordAndStat[0]);

  // Scope and then randomize the words again
  for (let i = sortedWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sortedWords[i], sortedWords[j]] = [sortedWords[j], sortedWords[i]];
  }

  return sortedWords;
}

export const exerciseActions = {
  setFromModel: useExerciseStore.getState().setFromModel,
};
