import { bigrams } from "@data/bigrams"
import { tetragrams } from "@data/tetragrams"
import { trigrams } from "@data/trigrams"
import { SingleSetting } from "./settings"

export interface Lesson {
  id?: string
  custom: boolean
  title: string
  shortDescription?: string
  words: string[]
  settings?: LessonSettings
}

export interface LessonSettings {
  delimiter?: SingleSetting<string>
  keepSpaces?: boolean
  chorded?: boolean
}

export namespace Lesson {
  export function New(): Lesson {
    return {
      custom: true,
      title: "",
      words: [],
      settings: {},
    }
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
]
