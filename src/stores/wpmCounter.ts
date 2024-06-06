import { create } from "zustand";
const charatersPerWord = 5;

interface WpmCounterStore {
  charTime: Date[];
  lastSetCharIndex: number;
  updateCharTime: (index: number) => void;
  exercise: string;
  setExercise: (exercise: string) => void;
  getWpm: () => number;
  getWordWpm: (word: string) => number;
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
    set({ charTime, lastSetCharIndex: index });
  },
  exercise: "",
  setExercise: (exercise: string) => {
    const date = new Date();
    set({ charTime: Array(exercise.length).fill(date) });
    set({ exercise });
  },
  getWpm: () => {
    const { charTime, lastSetCharIndex } = get();
    if (charTime.length === 0) {
      return 0;
    }

    for (let i = 0; i <= lastSetCharIndex; i++) {
      console.log(`chartime[${i}]: ${charTime[i].getTime()}`);
    }

    const startTime = charTime[0];
    const endTime = charTime[lastSetCharIndex];
    console.log(`getWpm() 0-${lastSetCharIndex}`);
    const time = (endTime.getTime() - startTime.getTime()) / 1000 / 60;
    if (time <= 0) {
      return 0;
    }

    const wpm = lastSetCharIndex / charatersPerWord / time;
    console.log(
      `getWpm() ${wpm} = ${lastSetCharIndex} / ${charatersPerWord} / ${time}`,
    );
    return wpm;
  },
  getWordWpm: (word: string) => {
    const { charTime, lastSetCharIndex, exercise } = get();
    if (charTime.length === 0) {
      return 0;
    }

    const wordIndicies = findWordIndicies(exercise, word, lastSetCharIndex);

    if (wordIndicies.length === 0) {
      return 0;
    }

    let totalTime = 0;
    let totalLength = 0;
    wordIndicies.forEach(({ start, end }) => {
      const startTime = charTime[start];
      const endTime = charTime[end];
      const time = endTime.getTime() - startTime.getTime();
      if (time <= 0) {
        return 0;
      }
      totalTime += time;
      totalLength += end - start;
    });

    const averageWpm = (totalLength / charatersPerWord / totalTime) * 60 * 1000;
    console.log(
      `getWordWpm(${word}) ${averageWpm} = ${totalLength} / ${charatersPerWord} / ${totalTime}`,
    );

    return averageWpm;
  },
}));

interface WordIndex {
  start: number;
  end: number;
}

function findWordIndicies(exercise: string, word: string, maxIndex: number) {
  let startIndex = 0;
  let result: WordIndex[] = [];
  while ((startIndex = exercise.indexOf(word, startIndex)) !== -1) {
    let wordStartIndex = startIndex;
    if (wordStartIndex > 0 && exercise[wordStartIndex - 1] === " ") {
      wordStartIndex -= 1;
    }

    let endIndex = startIndex + word.length - 1;
    if (endIndex > maxIndex) {
      break;
    } else if (maxIndex !== endIndex && exercise[endIndex + 1] === " ") {
      endIndex += 1;
    }

    result.push({ start: wordStartIndex, end: endIndex });
    startIndex = endIndex + 1;
  }
  return result;
}

export default useWpmCounterStore;
