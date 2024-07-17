import { getWords } from "@db/word";
import {
  ExerciseGeneration,
  Exercises,
  MaxTime,
  OrderTypes,
  Target,
  Targets,
} from "@models/exercise";
import { defaultLessons, Lesson } from "@models/lesson";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { timerActions } from "./timer";

export interface PreviousWord {
  word: string;
  wpm: string;
  targetWpm: string;
  isHighscore: boolean;
}

export interface PreviousExercise {
  words: PreviousWord[];
  elapsedTime: string;
}

interface ExerciseStore extends Exercises {
  setLesson(lesson: Lesson): void;
  nextExercise(): void;
  getCurrentWords(): string[];
  getUniqueWords(): string[];
  setGeneration(generation: ExerciseGeneration): void;
  setMaxTime(maxTime: MaxTime): void;
  previousExercise: PreviousExercise;
  setPreviousExercise(previousExercise: PreviousExercise): void;
  completed: boolean;
  setTarget(target: Target): void;
}

type Replacements = {
  [key: string]: any;
};

const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get) => {
      async function resetExercises(extra: Replacements) {
        timerActions.resetTotal();
        const store = get();

        const allExercises = await generateExercise({ ...store, ...extra });
        set({
          allExercises,
          currentExerciseIndex: 0,
          completed: false,
          ...extra,
        });
      }

      return {
        lesson: defaultLessons[0],
        setLesson: async (lesson: Lesson) => {
          resetExercises({ lesson });
        },
        allExercises: [],
        currentExerciseIndex: 0,
        nextExercise: () => {
          timerActions.resetExercise();
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
          order: OrderTypes.Slowest,
          maxExercises: 20,
          maxExercisesEnabled: true,
        },
        setGeneration: async (generation: ExerciseGeneration) => {
          resetExercises({ generation });
        },
        maxTime: {
          minutes: 15,
          enabled: false,
        },
        setMaxTime: (maxTime: MaxTime) => set({ maxTime }),
        previousExercise: {
          words: [],
          elapsedTime: "",
        },
        setPreviousExercise: (previousExercise: PreviousExercise) =>
          set({ previousExercise }),
        completed: false,
        target: {
          selected: Targets.Percentage,
          percentage: 95,
          relative: -5,
        },
        setTarget: (target: Target) => {
          set({ target });
        },
      };
    },
    {
      name: "exercise",
    },
  ),
);

export default useExerciseStore;

async function generateExercise(exercises: Exercises): Promise<string[][]> {
  let words = await sortWords(
    exercises.lesson.words,
    exercises.generation.order,
  );
  words = filterByMaxExercises(words, exercises.generation);

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

async function sortWords(
  words: string[],
  order: OrderTypes,
): Promise<string[]> {
  switch (order) {
    case OrderTypes.Random:
      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
      }
      break;
    case OrderTypes.Slowest:
    default:
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
        const highestWpm = wordStats[i].highestWpm || 1;

        const differenceInTime =
          Date.now() - wordStats[i].lastPracticeDatetime.getTime();
        const daysSinceLastPracticed = differenceInTime / (1000 * 60 * 60 * 24);
        const decrease = 3 * daysSinceLastPracticed;

        const wordSortStat = highestWpm - decrease;

        wordAndStats.push([words[i], wordSortStat]);
      }

      // Sort the words by the sort statistics, lowest first
      wordAndStats.sort((a, b) => {
        return a[1] - b[1];
      });

      // Extract the words from the sorted array
      let sortedWords = wordAndStats.map((wordAndStat) => wordAndStat[0]);
      return sortedWords;
  }

  return words;
}

function filterByMaxExercises(
  words: string[],
  generation: ExerciseGeneration,
): string[] {
  if (generation.maxExercisesEnabled) {
    const maxWords = Math.min(
      words.length,
      generation.maxExercises * generation.combinations,
    );
    words = words.slice(0, maxWords);
  }

  // Randomize words in certain conditions
  if (
    generation.order !== OrderTypes.Random &&
    generation.maxExercisesEnabled
  ) {
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
  }

  return words;
}
