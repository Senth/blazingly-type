import { saveExercises } from "@db/user";
import { getWords } from "@db/word";
import { ExerciseGeneration, Exercises, Scopes } from "@models/exercise";
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
  setScope(scope: Scopes): void;
  previousExercise: PreviousWord[];
  setPreviousExercise(previousExercise: PreviousWord[]): void;
  completed: boolean;
  elapsedTime: string;
  startTime?: Date;
  startTimer: () => void;
  timerId?: NodeJS.Timeout;
}

type Extra = {
  [key: string]: any;
};

const useExerciseStore = create<ExerciseStore>((set, get) => {
  async function resetExercises(extra: Extra) {
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

  function saveToDB(extra: Extra) {
    const store = get();
    const exercises = getExercises({ ...store, ...extra });
    saveExercises(exercises);
  }

  function getExercises(extra: Extra): Exercises {
    const store = get();
    return {
      lesson: store.lesson,
      allExercises: store.allExercises,
      currentExerciseIndex: store.currentExerciseIndex,
      generation: store.generation,
      scope: store.scope,
      ...extra,
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
    },
    setGeneration: async (generation: ExerciseGeneration) => {
      if (generation.combinations <= 0 || generation.repetitions <= 0) {
        return;
      }

      resetExercises({ generation });
    },
    scope: Scopes.worst50,
    setScope: async (scope: Scopes) => {
      resetExercises({ scope });
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
  const words = await randomizeAndScopeWords(
    exercises.lesson.words,
    exercises.scope,
  );

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

async function randomizeAndScopeWords(
  words: string[],
  scope: Scopes,
): Promise<string[]> {
  // Fetch word statistics from the database
  const wordStats = await getWords(words);

  // Couldn't fetch word statistics, just randomize the words...
  if (wordStats.length !== words.length) {
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    return scopeWords(words, scope);
  }

  // Create sort statistics: WPM - 0.5 * days since last practiced
  const wordAndStats: [string, number][] = [];
  for (let i = 0; i < words.length; i++) {
    console.log(wordStats[i]);
    const lastWpm = wordStats[i].lastPracticeWpm;

    const differenceInTime =
      Date.now() - wordStats[i].lastPracticeDatetime.getTime();
    const daysSinceLastPracticed = differenceInTime / (1000 * 60 * 60 * 24);
    const decrease = 0.5 * daysSinceLastPracticed;

    const wordSortStat = lastWpm - decrease;

    wordAndStats.push([words[i], wordSortStat]);
  }
  console.log("before sort");
  console.log(wordAndStats);

  // Sort the words by the sort statistics, lowest first
  wordAndStats.sort((a, b) => {
    return a[1] - b[1];
  });
  console.log("after sort");
  console.log(wordAndStats);

  // Extract the words from the sorted array
  let sortedWords = wordAndStats.map((wordAndStat) => wordAndStat[0]);

  // Scope and then randomize the words again
  sortedWords = scopeWords(sortedWords, scope);
  for (let i = sortedWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sortedWords[i], sortedWords[j]] = [sortedWords[j], sortedWords[i]];
  }

  return sortedWords;
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

export const exerciseActions = {
  setFromModel: useExerciseStore.getState().setFromModel,
};
