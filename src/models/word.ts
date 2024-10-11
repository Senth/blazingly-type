import hashjs from "hash.js";

export interface Word {
  word: string;
  highest: WpmInfo;
  lastPractice: WpmInfo;
  chordHighest?: WpmInfo;
  chordLastPractice?: WpmInfo;
  version: number;
}

export interface WpmInfo {
  wpm: number;
  date: Date;
}

function newWpmInfo(wpm: number): WpmInfo {
  return {
    wpm,
    date: new Date(),
  };
}

export namespace Word {
  export const latestVersion = 1;

  export function hash(word: string): string {
    return hashjs.sha256().update(word).digest("hex");
  }

  export function New(word: string): Word {
    return {
      word: word,
      highest: newWpmInfo(0),
      lastPractice: newWpmInfo(0),
      version: latestVersion,
    };
  }

  export function updateWpm(word: Word, wpm: number): Word {
    const date = new Date();
    if (wpm > word.highest.wpm) {
      word.highest.wpm = wpm;
      word.highest.date = date;
    }

    word.lastPractice.wpm = wpm;
    word.lastPractice.date = date;

    return word;
  }

  export function updateChordWpm(word: Word, wpm: number): Word {
    const date = new Date();
    if (!word.chordHighest) {
      word.chordHighest = newWpmInfo(0);
    }
    if (!word.chordLastPractice) {
      word.chordLastPractice = newWpmInfo(0);
    }

    if (wpm > word.chordHighest.wpm) {
      word.chordHighest.wpm = wpm;
      word.chordHighest.date = date;
    }

    word.chordLastPractice.wpm = wpm;
    word.chordLastPractice.date = date;

    return word;
  }

  export function isLatest(word: any): word is Word {
    return word.version === latestVersion;
  }

  export function migrate(word: any): Word {
    const version = word.version ?? 0;

    const newWord: Word = New(word.word);
    if (version === 0) {
      newWord.highest.wpm = word.highestWpm;
      newWord.highest.date = word.highestWpmDatetime;
      newWord.lastPractice.wpm = word.lastPracticeWpm;
      newWord.lastPractice.date = word.lastPracticeDatetime;
    }

    return newWord;
  }
}
