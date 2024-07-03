import { bigrams } from "@data/bigrams";
import { tetragrams } from "@data/tetragrams";
import { trigrams } from "@data/trigrams";

export interface Lesson {
  id?: string;
  custom: boolean;
  title: string;
  shortDescription?: string;
  words: string[];
}

export namespace Lesson {
  export function New(): Lesson {
    return {
      custom: false,
      title: "",
      words: [],
    };
  }
}

export const defaultLessons: Lesson[] = [
  {
    id: "bigrams-default",
    title: "Bigrams",
    custom: false,
    shortDescription: "Practice typing bigrams",
    words: bigrams,
  },
  {
    id: "trigrams-default",
    title: "Trigrams",
    custom: false,
    shortDescription: "Practice typing trigrams",
    words: trigrams,
  },
  {
    id: "tetragrams-default",
    title: "Tetragrams",
    custom: false,
    shortDescription: "Practice typing tetragrams",
    words: tetragrams,
  },
];
