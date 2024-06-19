import hashjs from "hash.js";

export interface Word {
  word: string;
  highestWpm: number;
  highestWpmDatetime: Date;
  lastPracticeWpm: number;
  lastPracticeDatetime: Date;
}

export namespace Word {
  export function hash(word: string): string {
    return hashjs.sha256().update(word).digest("hex");
  }

  export function New(word: string): Word {
    return {
      word: word,
      highestWpm: 0,
      highestWpmDatetime: new Date(0),
      lastPracticeWpm: 0,
      lastPracticeDatetime: new Date(0),
    };
  }

  export function updateWpm(word: Word, wpm: number): Word {
    const date = new Date();
    if (wpm > word.highestWpm) {
      word.highestWpm = wpm;
      word.highestWpmDatetime = date;
    }

    word.lastPracticeWpm = wpm;
    word.lastPracticeDatetime = date;

    return word;
  }
}
