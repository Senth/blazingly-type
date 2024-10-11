import { create } from "zustand";
const charatersPerWord = 5;

interface WpmCounterStore {
  charTime: Date[];
  lastSetCharIndex: number;
  updateCharTime: (index: number) => void;
  words: string[];
  exercise: string;
  setExercise: (exercise: string, words: string[]) => void;
  resetExercise: () => void;
  getWpm: () => number;
  getWordWpm: (word: string, chorded?: boolean) => number;
}

const useWpmCounterStore = create<WpmCounterStore>((set, get) => ({
  charTime: [],
  lastSetCharIndex: 0,
  updateCharTime: (index: number) => {
    const charTime = [...get().charTime];
    if (charTime.length <= index) {
      return;
    }
    charTime[index] = new Date();

    // Special case when entering the first character, we want to reset the date for the remaining characters
    if (index === 0) {
      for (let i = 1; i < charTime.length; i++) {
        charTime[i] = new Date();
      }
    }

    set({ charTime, lastSetCharIndex: index });
  },
  words: [],
  exercise: "",
  setExercise: (exercise: string, words: string[]) => {
    const date = new Date();
    set({ charTime: Array(exercise.length).fill(date) });
    set({ exercise, words });
  },
  resetExercise: () => {
    const date = new Date();
    set({ charTime: Array(get().exercise.length).fill(date) });
  },
  getWpm: () => {
    const { charTime, lastSetCharIndex } = get();
    if (charTime.length === 0 || lastSetCharIndex > charTime.length) {
      return 0;
    }

    const startTime = charTime[0];
    const endTime = charTime[lastSetCharIndex];

    if (!startTime || !endTime) {
      return 0;
    }

    const time = (endTime.getTime() - startTime.getTime()) / 1000 / 60;
    if (time <= 0) {
      return 0;
    }

    const wpm = lastSetCharIndex / charatersPerWord / time;
    return wpm;
  },
  getWordWpm: (word: string, chorded?: boolean) => {
    const { charTime, lastSetCharIndex, exercise, words } = get();
    if (charTime.length === 0) {
      return 0;
    }

    let wordIndicies: WordIndex[] = [];
    if (chorded) {
      wordIndicies = findChordIndicies(exercise, word);
    } else {
      wordIndicies = findWordIndicies(exercise, words, word, lastSetCharIndex);
    }

    if (wordIndicies.length === 0) {
      return 0;
    }

    let totalTime = 0;
    let totalLength = 0;
    wordIndicies.forEach(({ start, end }) => {
      const startTime = charTime[start];
      const endTime = charTime[end];

      if (!startTime || !endTime) {
        return 0;
      }

      const time = endTime.getTime() - startTime.getTime();
      if (time <= 0) {
        return 0;
      }
      totalTime += time;
      totalLength += end - start;
    });

    const averageWpm = (totalLength / charatersPerWord / totalTime) * 60 * 1000;

    if (isNaN(averageWpm)) {
      return 0;
    }

    return averageWpm;
  },
}));

interface WordIndex {
  start: number;
  end: number;
}

function findWordIndicies(
  exercise: string,
  words: string[],
  word: string,
  maxIndex: number,
): WordIndex[] {
  const wordInfo = getCurrentAndNextInfo(words, word);

  let startIndex = 0;
  let result: WordIndex[] = [];
  while ((startIndex = exercise.indexOf(word, startIndex)) !== -1) {
    // "hello", "world"     -> "hello world hello world"
    // hello:       		      	s    e     s     e
    // world:                        s     e     s    e
    // "hello", " world "   -> "hello world hello world "
    // hello:       		      	s   e      s    e
    // world:                       s      e    s      e
    // " hello ", " world " -> " hello  world  hello  world "
    // hello:       		      	s     e      s      e
    // world:                         s      e      s      e

    // Start index
    let wordStartIndex = startIndex;
    if (wordStartIndex > 0) {
      if (wordInfo.current.startsWithSpace) {
        wordStartIndex -= 1;
      } else if (exercise[wordStartIndex - 1] === " ") {
        wordStartIndex -= 1;
      }
    }

    // End index
    let endIndex = startIndex + word.length - 1;
    if (endIndex > maxIndex) {
      break;
    }
    if (
      endIndex < maxIndex &&
      !wordInfo.current.endsWithSpace &&
      !wordInfo.next.startsWithSpace
    ) {
      endIndex = endIndex + 1;
    }

    result.push({ start: wordStartIndex, end: endIndex });
    startIndex = endIndex + 1;
  }
  return result;
}

function findChordIndicies(exercise: string, word: string): WordIndex[] {
  let startIndex = 0;
  let result: WordIndex[] = [];
  while ((startIndex = exercise.indexOf(word, startIndex)) !== -1) {
    // "hello", "world"     -> " hello world hello world"
    // hello:       		      	se          se
    // world:                         se          se
    // "hello", " world "   -> " hello world hello world "
    // hello:       		      	se          se
    // world:                        se          se
    // " hello ", " world " -> " hello  world  hello  world "
    // hello:       		      	N/A          se
    // world:                         se            se
    // Note that the first word in an exercise can't be calculated correctly if we don't add a space or something else before it.

    // If the word is the first character in the exercise, we can't calculate the WPM correctly. Skip this word.
    if (startIndex === 0) {
      startIndex += word.length;
      continue;
    }

    result.push({ start: startIndex - 1, end: startIndex });
    startIndex += word.length;
  }
  return result;
}

interface WordInfo {
  startsWithSpace: boolean;
  endsWithSpace: boolean;
}

interface WordsInfo {
  current: WordInfo;
  next: WordInfo;
}

function getCurrentAndNextInfo(words: string[], word: string): WordsInfo {
  const next = getNextWord(words, word);

  return {
    current: getWordInfo(word),
    next: getWordInfo(next),
  };
}

function getWordInfo(word: string): WordInfo {
  return {
    startsWithSpace: word[0] === " ",
    endsWithSpace: word[word.length - 1] === " ",
  };
}

function getNextWord(words: string[], word: string): string {
  if (word.length === 1) {
    return word;
  }

  const wordIndex = words.indexOf(word);
  if (wordIndex === -1) {
    return "";
  }

  const nextWord = words[wordIndex === words.length - 1 ? 0 : wordIndex + 1];
  return nextWord;
}

export default useWpmCounterStore;
