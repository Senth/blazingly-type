import { bigrams } from "@data/bigrams";
import { tetragrams } from "@data/tetragrams";
import { trigrams } from "@data/trigrams";

export interface Lesson {
  title: string;
  shortDescription?: string;
  words: string[];
}

export const defaultLessons: Lesson[] = [
  {
    title: "Bigrams",
    shortDescription: "Practice typing bigrams",
    words: bigrams,
  },
  {
    title: "Trigrams",
    shortDescription: "Practice typing trigrams",
    words: trigrams,
  },
  {
    title: "Tetragrams",
    shortDescription: "Practice typing tetragrams",
    words: tetragrams,
  },
];
