import { createHash } from "crypto";

export interface Word {
  word: string;
  highestWpm: number;
  highestWpmDatetime: Date;
  lastPracticeWpm: number;
  lastPracticeDatetime: Date;
}

export namespace Word {
  export function hash(word: string): string {
    return createHash("sha256").update(word).digest("hex");
  }
}
